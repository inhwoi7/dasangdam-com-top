import "server-only";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN }) as any;

function getDatabaseId() {
  const databaseId = process.env.NOTION_DATABASE_ID;
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

function getTitle(prop: any) {
  return getPlainText(prop?.title ?? []);
}

function getRichText(prop: any) {
  return getPlainText(prop?.rich_text ?? []);
}

function getSelect(prop: any) {
  return prop?.select?.name ?? "";
}

function getCheckbox(prop: any) {
  return Boolean(prop?.checkbox);
}

function getDate(prop: any) {
  return prop?.date?.start ?? "";
}

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

/**
 * TODAY'S PICK:
 * Published=true, Type=quote 인 글 중 최신 1개
 */
export async function getFeaturedQuote(): Promise<PostItem | null> {
  try {
    const response = await notion.databases.query({
      database_id: getDatabaseId(),
      filter: {
        and: [
          {
            property: "Published",
            checkbox: { equals: true },
          },
          {
            property: "Type",
            select: { equals: "quote" },
          },
        ],
      },
      sorts: [
        {
          property: "PublishedDate",
          direction: "descending",
        },
      ],
      page_size: 1,
    });

    const first = response.results[0];
    return first ? mapPost(first) : null;
  } catch (error) {
    console.error("[getFeaturedQuote] Notion API 오류:", error);
    return null;
  }
}

/**
 * 다상담 서재:
 * Published=true, Type=article 인 글 최신순
 */
export async function getArticlePosts(limit = 10): Promise<PostItem[]> {
  try {
    const response = await notion.databases.query({
      database_id: getDatabaseId(),
      filter: {
        and: [
          {
            property: "Published",
            checkbox: { equals: true },
          },
          {
            property: "Type",
            select: { equals: "article" },
          },
        ],
      },
      sorts: [
        {
          property: "PublishedDate",
          direction: "descending",
        },
      ],
      page_size: limit,
    });

    return response.results.map(mapPost);
  } catch (error) {
    console.error("[getArticlePosts] Notion API 오류:", error);
    return [];
  }
}

/**
 * slug로 단일 글 조회
 */
export async function getPostBySlug(slug: string) {
  try {
    const response = await notion.databases.query({
      database_id: getDatabaseId(),
      filter: {
        and: [
          {
            property: "Published",
            checkbox: { equals: true },
          },
          {
            property: "Slug",
            rich_text: { equals: slug },
          },
        ],
      },
      page_size: 1,
    });

    const page = response.results[0];
    if (!page) return null;

    const post = mapPost(page);
    const blocks = await getAllBlocks(page.id);

    return { ...post, blocks };
  } catch (error) {
    console.error("[getPostBySlug] Notion API 오류:", error);
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

// 기존 함수명 호환
export const getFeaturedPost = getFeaturedQuote;
export const getPublishedPosts = getArticlePosts;