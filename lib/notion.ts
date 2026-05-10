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
  title_en?: string;
  slug: string;
  excerpt: string;
  excerpt_en?: string;
  en_page_id?: string;
  language?: string;
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
    title_en:      getRichText(p.Title_EN) || undefined,
    slug:          slug || page.id,
    excerpt:       getRichText(p.Excerpt),
    excerpt_en:    getRichText(p.Exerpt_EN) || undefined,
    en_page_id:    getRichText(p.EN_Page_ID) || undefined,
    language:      getSelect(p.Language) || undefined,
    category:      getSelect(p.Category),
    type:          getSelect(p.Type),
    publishedDate: getDate(p.PublishedDate),
    featured:      getCheckbox(p.Featured),
    thumbnail:     getFileUrl(p.Thumbnail) || undefined,
  };
}

// KO: Language=KO 또는 비어있는 글, EN: Language=EN만
function buildLanguageFilter(locale: string) {
  if (locale === "en") {
    return { property: "Language", select: { equals: "EN" } };
  }
  // KO: Language=KO이거나 Language가 없는 글 (기존 글 포함)
  return {
    or: [
      { property: "Language", select: { equals: "KO" } },
      { property: "Language", select: { is_empty: true } },
    ],
  };
}

export async function getFeaturedQuote(locale = "ko"): Promise<PostItem | null> {
  try {
    const lang = locale === "en" ? "EN" : "KO";
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type",      select:   { equals: "quote" } },
          { property: "Language",  select:   { equals: lang } },
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

export async function getArticlePosts(limit = 10, locale = "ko"): Promise<PostItem[]> {
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type",      select:   { equals: "article" } },
          buildLanguageFilter(locale),
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: limit + 10, // 여유분 더 가져와서 EN 글 혹시 섞인 거 제거 후 limit 맞춤
    });

    let results: PostItem[] = data.results?.map(mapPost) ?? [];

    // KO일 때 혹시라도 EN 글이 섞이면 제거 (이중 안전장치)
    if (locale === "ko") {
      results = results.filter((p) => p.language !== "EN");
    }

    return results.slice(0, limit);
  } catch (e: any) {
    console.error("[getArticlePosts]", e.message);
    return [];
  }
}

export async function getQuotePosts(limit = 100, locale = "ko"): Promise<PostItem[]> {
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type",      select:   { equals: "quote" } },
          buildLanguageFilter(locale),
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: limit,
    });

    let results: PostItem[] = data.results?.map(mapPost) ?? [];
    if (locale === "ko") {
      results = results.filter((p) => p.language !== "EN");
    }
    return results;
  } catch (e: any) {
    console.error("[getQuotePosts]", e.message);
    return [];
  }
}

export async function getArticlePostsPaginated(
  page = 1,
  pageSize = 10,
  locale = "ko"
): Promise<{ posts: PostItem[]; totalCount: number; hasMore: boolean }> {
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type",      select:   { equals: "article" } },
          buildLanguageFilter(locale),
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: 100,
    });

  
    let all: PostItem[] = data.results?.map(mapPost) ?? [];
    if (locale === "ko") {
      all = all.filter((p) => p.language !== "EN");
    }

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

export async function getPostBySlug(slug: string, locale = "ko") {
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

    const post = mapPost(page);

    if (locale === "en" && post.en_page_id) {
      try {
        const enBlocks = await getAllBlocks(post.en_page_id);
        return {
          ...post,
          title: post.title_en || post.title,
          excerpt: post.excerpt_en || post.excerpt,
          blocks: enBlocks,
        };
      } catch {
        // 영어 페이지 실패 시 한국어로 fallback
      }
    }

    return { ...post, blocks: await getAllBlocks(page.id) };
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
