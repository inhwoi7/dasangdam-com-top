// app/api/naming/recommend/route.ts
// AI 작명 추천 (무료: 2개 / 유료: 5개)

import { NextRequest, NextResponse } from "next/server";
import { generateNamingRecommendations } from "@/lib/naming/engine";
import { supabase } from "@/lib/supabase";
import type { NamingEngineInput } from "@/lib/naming/engine";

export async function POST(req: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json() as NamingEngineInput & { requestId?: string };

  // 무료/유료 분기
  const isPaid = user ? await checkUserPaid(supabase, user.id) : false;
  const maxResults = isPaid ? 5 : 2;

  try {
    const recommendations = await generateNamingRecommendations({
      ...body,
      maxResults,
    });

    // 결과 저장 (나중에 PDF 생성 때 재사용)
    if (body.requestId) {
      await supabase
        .from("naming_requests")
        .update({
          recommended_names: recommendations,
          is_paid: isPaid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.requestId);
    }

    // 무료 사용자는 한자 뜻 마스킹
    const responseData = isPaid
      ? recommendations
      : recommendations.map((r) => ({
          ...r,
          hanjaDetails: r.hanjaDetails.map((h) => ({
            ...h,
            meaning: "🔒 유료 공개",
          })),
          score: { ...r.score, summary: "🔒 유료 공개" },
        }));

    return NextResponse.json({ ok: true, isPaid, results: responseData });
  } catch (err: any) {
    console.error("[naming/recommend]", err);
    return NextResponse.json({ error: "추천 생성 실패" }, { status: 500 });
  }
}

async function checkUserPaid(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("naming_requests")
    .select("is_paid")
    .eq("user_id", userId)
    .eq("is_paid", true)
    .limit(1)
    .maybeSingle();
  return !!data;
}
