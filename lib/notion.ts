import "server-only";

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_VERSION = "2022-06-28";

async function notionFetch(endpoint: string, body?: object) {
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API 오류 ${res.status}: ${err}`);
  }

  return res.json();
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
  const slug = getRichText(p.Slug);
  return {
    id:            page.id,
    title:         getTitle(p.Title),
    slug:          slug || page.id,
    excerpt:       getRichText(p.Excerpt),
    category:      getSelect(p.Category),
    type:          getSelect(p.Type),
    publishedDate: getDate(p.PublishedDate),
    featured:      getCheckbox(p.Featured),
    thumbnail:     getFileUrl(p.Thumbnail) || undefined,
  };
}

export async function getFeaturedQuote(): Promise<PostItem | null> {
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
    return data.results?.[0] ? mapPost(data.results[0]) : null;
  } catch (e: any) {
    console.error("[getFeaturedQuote]", e.message);
    return null;
  }
}

export async function getArticlePosts(limit = 10): Promise<PostItem[]> {
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
    return data.results?.map(mapPost) ?? [];
  } catch (e: any) {
    console.error("[getArticlePosts]", e.message);
    return [];
  }
}

export async function getQuotePosts(limit = 100): Promise<PostItem[]> {
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type", select: { equals: "quote" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: limit,
    });
    return data.results?.map(mapPost) ?? [];
  } catch (e: any) {
    console.error("[getQuotePosts]", e.message);
    return [];
  }
}

export async function getArticlePostsPaginated(
  page = 1,
  pageSize = 10
): Promise<{ posts: PostItem[]; totalCount: number; hasMore: boolean }> {
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type", select: { equals: "article" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: 100,
    });
    const all: PostItem[] = data.results?.map(mapPost) ?? [];
    const start = (page - 1) * pageSize;
    const posts = all.slice(start, start + pageSize);
    return {
      posts,
      totalCount: all.length,
      hasMore: start + pageSize < all.length,
    };
  } catch (e: any) {
    console.error("[getArticlePostsPaginated]", e.message);
    return { posts: [], totalCount: 0, hasMore: false };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        property: "Slug",
        rich_text: { equals: slug },
      },
      page_size: 1,
    });

    let page = data.results?.[0];

    if (!page) {
      try {
        const pageData = await notionFetch(`/pages/${slug}`);
        if (pageData?.id) page = pageData;
      } catch {
        return null;
      }
    }

    if (!page) return null;
    return { ...mapPost(page), blocks: await getAllBlocks(page.id) };
  } catch (e: any) {
    console.error("[getPostBySlug]", e.message);
    return null;
  }
}

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

export const getFeaturedPost   = getFeaturedQuote;
export const getPublishedPosts = getArticlePosts;
