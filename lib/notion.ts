import "server-only";

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_VERSION = "2022-06-28";

// ─── 공통 fetch 헬퍼 ───
async function notionFetch(endpoint: string, body?: object) {
  console.log("────────────────────────────────");
  console.log("[notionFetch] endpoint:", endpoint);
  console.log("[ENV] TOKEN :", NOTION_TOKEN ? NOTION_TOKEN.slice(0, 12) + "..." : "❌ 없음");
  console.log("[ENV] DB_ID :", NOTION_DATABASE_ID ?? "❌ 없음");

  const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store", // 항상 최신 데이터
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[notionFetch] ❌ HTTP 오류:", res.status, err);
    throw new Error(`Notion API 오류 ${res.status}: ${err}`);
  }

  const json = await res.json();
  console.log("[notionFetch] ✅ 응답 results 수:", json.results?.length ?? "N/A");
  return json;
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
  console.log("[mapPost]", mapped.title, "/ type:", mapped.type, "/ slug:", mapped.slug);
  return mapped;
}

// ─── getFeaturedQuote ───
export async function getFeaturedQuote(): Promise<PostItem | null> {
  console.log("▶ [getFeaturedQuote] 시작");
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type",      select:   { equals: "quote" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: 1,
    });

    if (!data.results?.length) {
      console.log("[getFeaturedQuote] ⚠️ 결과 없음");

      // 디버그: 필터 없이 전체 조회해서 실제 컬럼명 확인
      const all = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, { page_size: 1 });
      if (all.results?.length) {
        console.log("[DEBUG] 실제 프로퍼티 키:", Object.keys(all.results[0].properties));
      }
      return null;
    }
    return mapPost(data.results[0]);
  } catch (e: any) {
    console.error("[getFeaturedQuote] ❌", e.message);
    return null;
  }
}

// ─── getArticlePosts ───
export async function getArticlePosts(limit = 10): Promise<PostItem[]> {
  console.log("▶ [getArticlePosts] 시작");
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type",      select:   { equals: "article" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: limit,
    });

    if (!data.results?.length) {
      console.log("[getArticlePosts] ⚠️ 결과 없음");

      // 디버그: 필터 없이 전체 조회해서 실제 컬럼명 확인
      const all = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, { page_size: 1 });
      if (all.results?.length) {
        console.log("[DEBUG] 실제 프로퍼티 키:", Object.keys(all.results[0].properties));
        for (const [key, val] of Object.entries(all.results[0].properties as any)) {
          const v = val as any;
          console.log(`  - ${key} (${v.type}):`, JSON.stringify(v[v.type]));
        }
      } else {
        console.log("[DEBUG] ❌ DB 자체가 비어 있음");
      }
      return [];
    }
    return data.results.map(mapPost);
  } catch (e: any) {
    console.error("[getArticlePosts] ❌", e.message);
    return [];
  }
}

// ─── getPostBySlug ───
export async function getPostBySlug(slug: string) {
  console.log("▶ [getPostBySlug] slug:", slug);
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox:  { equals: true } },
          { property: "Slug",      rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });

    const page = data.results?.[0];
    if (!page) return null;
    return { ...mapPost(page), blocks: await getAllBlocks(page.id) };
  } catch (e: any) {
    console.error("[getPostBySlug] ❌", e.message);
    return null;
  }
}

// ─── getAllBlocks ───
export async function getAllBlocks(blockId: string): Promise<any[]> {
  const all: any[] = [];
  let cursor: string | undefined;

  do {
    const url = `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const data = await notionFetch(url);
    for (const block of data.results ?? []) {
      if (block.has_children) block.children = await getAllBlocks(block.id);
      all.push(block);
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return all;
}

export const getFeaturedPost  = getFeaturedQuote;
export const getPublishedPosts = getArticlePosts;
