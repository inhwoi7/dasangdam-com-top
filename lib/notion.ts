import "server-only";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN }) as any;

function getDatabaseId(): string {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  console.log("────────────────────────────────");
  console.log("[ENV] NOTION_TOKEN     :", token ? token.slice(0, 12) + "..." : "❌ 없음");
  console.log("[ENV] NOTION_DATABASE_ID:", databaseId ?? "❌ 없음");
  console.log("────────────────────────────────");

  if (!databaseId) throw new Error("NOTION_DATABASE_ID가 설정되지 않았습니다.");
  return databaseId;
}

export type PostItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  type: string;
  publishedDate: string;
  featured: boolean;
  thumbnail?: string;
};

function getPlainText(richText: any[] = []) {
  return richText.map((i) => i?.plain_text ?? "").join("");
}
function getTitle(p: any)    { return getPlainText(p?.title ?? []); }
function getRichText(p: any) { return getPlainText(p?.rich_text ?? []); }
function getSelect(p: any)   { return p?.select?.name ?? ""; }
function getCheckbox(p: any) { return Boolean(p?.checkbox); }
function getDate(p: any)     { return p?.date?.start ?? ""; }
function getFileUrl(p: any) {
  const f = p?.files?.[0];
  if (!f) return "";
  return f.type === "external" ? f.external.url : f.type === "file" ? f.file.url : "";
}

function mapPost(page: any): PostItem {
  const p = page.properties;
  const mapped = {
    id:            page.id,
    title:         getTitle(p.Title),
    slug:          getRichText(p.Slug),
    excerpt:       getRichText(p.Excerpt),
    category:      getSelect(p.Category),
    type:          getSelect(p.Type),
    publishedDate: getDate(p.PublishedDate),
    featured:      getCheckbox(p.Featured),
    thumbnail:     getFileUrl(p.Thumbnail) || undefined,
  };
  console.log("[mapPost] 매핑 결과:", JSON.stringify(mapped));
  return mapped;
}

// ─── 디버그용: 필터 없이 DB 전체를 1건 조회해서 실제 컬럼명 확인 ───
async function debugPrintRawRow(dbId: string) {
  try {
    const res = await notion.databases.query({ database_id: dbId, page_size: 1 });
    if (res.results.length === 0) {
      console.log("[DEBUG] ❌ DB 자체가 비어 있습니다.");
      return;
    }
    const row = res.results[0];
    console.log("[DEBUG] 실제 프로퍼티 키 목록:", Object.keys(row.properties));
    for (const [key, val] of Object.entries(row.properties as any)) {
      const v = val as any;
      console.log(`  - ${key} (${v.type}):`, JSON.stringify(v[v.type]));
    }
  } catch (e: any) {
    console.error("[DEBUG] 전체 조회 실패:", e.message);
  }
}

// ─── getFeaturedQuote ───
export async function getFeaturedQuote(): Promise<PostItem | null> {
  console.log("▶ [getFeaturedQuote] 시작");
  try {
    const dbId = getDatabaseId();
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type",      select:   { equals: "quote" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: 1,
    });

    console.log("[getFeaturedQuote] 결과 수:", response.results.length);
    if (response.results.length === 0) {
      console.log("[getFeaturedQuote] ⚠️ 결과 없음 → 전체 row 확인 시작");
      await debugPrintRawRow(dbId);
      return null;
    }
    return mapPost(response.results[0]);
  } catch (e: any) {
    console.error("[getFeaturedQuote] ❌ 오류:", e.message);
    return null;
  }
}

// ─── getArticlePosts ───
export async function getArticlePosts(limit = 10): Promise<PostItem[]> {
  console.log("▶ [getArticlePosts] 시작");
  try {
    const dbId = getDatabaseId();
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type",      select:   { equals: "article" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: limit,
    });

    console.log("[getArticlePosts] 결과 수:", response.results.length);
    if (response.results.length === 0) {
      console.log("[getArticlePosts] ⚠️ 결과 없음 → 전체 row 확인 시작");
      await debugPrintRawRow(dbId);
      return [];
    }
    return response.results.map(mapPost);
  } catch (e: any) {
    console.error("[getArticlePosts] ❌ 오류:", e.message);
    return [];
  }
}

// ─── getPostBySlug ───
export async function getPostBySlug(slug: string) {
  console.log("▶ [getPostBySlug] slug:", slug);
  try {
    const response = await notion.databases.query({
      database_id: getDatabaseId(),
      filter: {
        and: [
          { property: "Published", checkbox:  { equals: true } },
          { property: "Slug",      rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });

    console.log("[getPostBySlug] 결과 수:", response.results.length);
    const page = response.results[0];
    if (!page) return null;
    return { ...mapPost(page), blocks: await getAllBlocks(page.id) };
  } catch (e: any) {
    console.error("[getPostBySlug] ❌ 오류:", e.message);
    return null;
  }
}

export async function getAllBlocks(blockId: string): Promise<any[]> {
  let cursor: string | undefined;
  const all: any[] = [];
  do {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 });
    for (const block of res.results as any[]) {
      if (block.has_children) block.children = await getAllBlocks(block.id);
      all.push(block);
    }
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);
  return all;
}

export const getFeaturedPost  = getFeaturedQuote;
export const getPublishedPosts = getArticlePosts;
