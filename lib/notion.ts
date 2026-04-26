import "server-only";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function getDatabaseId() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID가 설정되지 않았습니다.");
  }
  return databaseId;
}

let cachedDataSourceId: string | null = null;

async function getDataSourceId() {
  if (cachedDataSourceId) return cachedDataSourceId;

  const database = await notion.databases.retrieve({
    database_id: getDatabaseId(),
  });

  const dataSourceId = (database as any)?.data_sources?.[0]?.id;

  if (!dataSourceId) {
    throw new Error(
      "이 데이터베이스에서 data source ID를 찾지 못했습니다. Notion DB 구조를 다시 확인해주세요."
    );
  }

  cachedDataSourceId = dataSourceId;
  return dataSourceId;
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
 * Published=true, Type=quote 인 글 중
 * PublishedDate가 가장 최신인 1개를 가져옵니다.
 */
export async function getFeaturedQuote(): Promise<PostItem | null> {
  const dataSourceId = await getDataSourceId();

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        {
          property: "Type",
          select: {
            equals: "quote",
          },
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
}

/**
 * 다상담 서재:
 * Published=true, Type=article 인 글만 최신순으로 가져옵니다.
 */
export async function getArticlePosts(limit = 10): Promise<PostItem[]> {
  const dataSourceId = await getDataSourceId();

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        {
          property: "Type",
          select: {
            equals: "article",
          },
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
}

/**
 * slug로 단일 글 조회
 * quote / article 구분 없이 Published=true 인 글 중에서 찾습니다.
 */
export async function getPostBySlug(slug: string) {
  const dataSourceId = await getDataSourceId();

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        {
          property: "Slug",
          rich_text: {
            equals: slug,
          },
        },
      ],
    },
    page_size: 1,
  });

  const page = response.results[0];
  if (!page) return null;

  const post = mapPost(page);
  const blocks = await getAllBlocks(page.id);

  return {
    ...post,
    blocks,
  };
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

/**
 * 기존 함수명 호환용
 * 예전 코드에서 getFeaturedPost / getPublishedPosts를 써도 동작하게 유지
 */
export const getFeaturedPost = getFeaturedQuote;
export const getPublishedPosts = getArticlePosts;
