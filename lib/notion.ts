import "server-only";
import { Client } from "@notionhq/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const notion = new Client({ auth: process.env.NOTION_TOKEN }) as any;

function getDatabaseId() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  // ✅ 환경변수 로그
  console.log("=== [Notion 환경변수 확인] ===");
  console.log("NOTION_TOKEN:", process.env.NOTION_TOKEN ? `${process.env.NOTION_TOKEN.slice(0, 10)}...` : "❌ 없음");
  console.log("NOTION_DATABASE_ID:", databaseId ?? "❌ 없음");

  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID가 설정되지 않았습니다.");
  }
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
  return richText.map((item) => item?.plain_text ?? "").join("");
}
function getTitle(prop: any) { return getPlainText(prop?.title ?? []); }
function getRichText(prop: any) { return getPlainText(prop?.rich_text ?? []); }
function getSelect(prop: any) { return prop?.select?.name ?? ""; }
function getCheckbox(prop: any) { return Boolean(prop?.checkbox); }
function getDate(prop: any) { return prop?.date?.start ?? ""; }
function getFileUrl(prop: any) {
  const file = prop?.files?.[0];
  if (!file) return "";
  if (file.type === "external") return file.external.url;
  if (file.type === "file") return file.file.url;
  return "";
}

function mapPost(page: any): PostItem {
  const p = page.properties;
  return {
    id: page.id,
    title: getTitle(p.Title),
    slug: getRichText(p.Slug),
    excerpt: getRichText(p.Excerpt),
    category: getSelect(p.Category),
    type: getSelect(p.Type),
    publishedDate: getDate(p.PublishedDate),
    featured: getCheckbox(p.Featured),
    thumbnail: getFileUrl(p.Thumbnail) || undefined,
  };
}

export async function getFeaturedQuote(): Promise<PostItem | null> {
  console.log("=== [getFeaturedQuote 시작] ===");
  try {
    const dbId = getDatabaseId();
    console.log("[getFeaturedQuote] DB ID:", dbId);

    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type", select: { equals: "quote" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: 1,
    });

    console.log("[getFeaturedQuote] 응답 결과 수:", response.results.length);
    if (response.results.length > 0) {
      const mapped = mapPost(response.results[0]);
      console.log("[getFeaturedQuote] 매핑된 글:", JSON.stringify(mapped, null, 2));
      return mapped;
    } else {
      console.log("[getFeaturedQuote] ⚠️ 결과 없음 - Notion에서 Published=true, Type=quote 인 글이 없습니다.");
      return null;
    }
  } catch (error) {
    console.error("[getFeaturedQuote] ❌ 오류:", error);
    return null;
  }
}

export async function getArticlePosts(limit = 10): Promise<PostItem[]> {
  console.log("=== [getArticlePosts 시작] ===");
  try {
    const dbId = getDatabaseId();
    console.log("[getArticlePosts] DB ID:", dbId);

    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type", select: { equals: "article" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: limit,
    });

    console.log("[getArticlePosts] 응답 결과 수:", response.results.length);
    if (response.results.length === 0) {
      console.log("[getArticlePosts] ⚠️ 결과 없음 - 필터 없이 전체 조회로 컬럼명 확인합니다...");

      // 필터 없이 첫 번째 row를 가져와서 실제 프로퍼티 키 확인
      const allResponse = await notion.databases.query({
        database_id: dbId,
        page_size: 1,
      });
      if (allResponse.results.length > 0) {
        console.log("[getArticlePosts] 🔍 실제 프로퍼티 키 목록:", Object.keys(allResponse.results[0].properties));
        console.log("[getArticlePosts] 🔍 첫 번째 row 전체:", JSON.stringify(allResponse.results[0].properties, null, 2));
      } else {
        console.log("[getArticlePosts] ❌ DB 자체가 완전히 비어있습니다.");
      }
    }

    return response.results.map(mapPost);
  } catch (error) {
    console.error("[getArticlePosts] ❌ 오류:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  console.log("=== [getPostBySlug 시작] slug:", slug, "===");
  try {
    const response = await notion.databases.query({
      database_id: getDatabaseId(),
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Slug", rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });

    console.log("[getPostBySlug] 결과 수:", response.results.length);
    const page = response.results[0];
    if (!page) return null;

    const post = mapPost(page);
    const blocks = await getAllBlocks(page.id);
    return { ...post, blocks };
  } catch (error) {
    console.error("[getPostBySlug] ❌ 오류:", error);
    return null;
  }
}

export async function getAllBlocks(blockId: string): Promise<any[]> {
  let cursor: string | undefined;
  const allBlocks: any[] = [];
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const block of response.results as any[]) {
      if (block.has_children) {
        block.children = await getAllBlocks(block.id);
      }
      allBlocks.push(block);
    }
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);
  return allBlocks;
}

export const getFeaturedPost = getFeaturedQuote;
export const getPublishedPosts = getArticlePosts;
