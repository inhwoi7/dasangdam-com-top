const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_VERSION = "2022-06-28";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 메모리 캐시 (Vercel 서버리스 인스턴스가 살아있는 동안 유지)
let cache: { data: object; timestamp: number } | null = null;
const CACHE_TTL = 1000 * 60 * 60; // 1시간

async function notionFetch(endpoint: string, body?: object) {
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    next: { revalidate: 3600 }, // Next.js 캐싱 1시간
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
    // 캐시가 유효하면 바로 반환
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return Response.json(cache.data, {
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

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
    const slug = getPlainText(p?.Slug?.rich_text ?? []) || page.id;

    const result = {
      quote: "오늘도 즐거운 탁구 되세요 🏓",
      sub_text: title,
      link_url: `https://www.dasangdam.com/blog/${slug}`,
      link_label: "자세히 보기",
      is_active: true,
    };

    // 캐시 저장
    cache = { data: result, timestamp: Date.now() };

    return Response.json(result, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    // Notion 실패 시 캐시된 데이터라도 반환
    if (cache) {
      return Response.json(cache.data, { headers: corsHeaders });
    }
    return Response.json(
      { quote: "오늘도 즐거운 탁구 되세요 🏓", sub_text: null, link_url: "https://www.dasangdam.com" },
      { headers: corsHeaders }
    );
  }
}
