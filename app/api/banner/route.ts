const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_VERSION = "2022-06-28";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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
  if (!res.ok) throw new Error(`Notion API 오류 ${res.status}`);
  return res.json();
}

function getPlainText(richText: any[] = []) {
  return richText.map((i) => i?.plain_text ?? "").join("");
}

export async function OPTIONS() {
  return Response.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Type", select: { equals: "quote" } },
          { property: "Language", select: { equals: "KO" } },
        ],
      },
      sorts: [{ property: "PublishedDate", direction: "descending" }],
      page_size: 1,
    });

    const page = data.results?.[0];
    if (!page) {
      return Response.json({ quote: null }, { headers: corsHeaders });
    }

    const p = page.properties;
    const title = getPlainText(p?.Title?.title ?? []);
    const excerpt = getPlainText(p?.Excerpt?.rich_text ?? []);
    const slug = getPlainText(p?.Slug?.rich_text ?? []) || page.id;

    return Response.json(
      {
        quote: "오늘도 즐거운 탁구 되세요 🏓",
        sub_text: title,
        excerpt: excerpt,
        link_url: `https://www.dasangdam.com/blog/${slug}`,
        link_label: "자세히 보기",
        is_active: true,
      },
      { headers: corsHeaders }
    );
  } catch (e: any) {
    return Response.json(
      { quote: "오늘도 즐거운 탁구 되세요 🏓", sub_text: null },
      { headers: corsHeaders }
    );
  }
}
