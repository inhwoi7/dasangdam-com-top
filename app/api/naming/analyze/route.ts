// app/api/naming/analyze/route.ts
// 이름 감명(鑑名) — 기존 이름 점수 계산 (무료)

import { NextRequest, NextResponse } from "next/server";
import { analyzeExistingName } from "@/lib/naming/engine";
import { supabase } from "@/lib/supabase";
import type { BirthInfo } from "@/lib/naming/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      nameHangul: string;
      strokesList: number[];
      birthInfo?: BirthInfo;
    };

    if (!body.nameHangul || !Array.isArray(body.strokesList)) {
      return NextResponse.json({ error: "필수 값 누락" }, { status: 400 });
    }
    if (body.nameHangul.length !== body.strokesList.length) {
      return NextResponse.json(
        { error: "이름 길이와 획수 배열 길이가 다릅니다" },
        { status: 400 }
      );
    }

    // DB 캐시 확인 (같은 이름+획수 조합은 재계산 불필요)

    const { data: cached } = await supabase
      .from("naming_analysis_cache")
      .select("analysis_result")
      .eq("name_hangul", body.nameHangul)
      .eq("strokes_list", body.strokesList)
      .maybeSingle();

    if (cached && !body.birthInfo) {
      return NextResponse.json({ ok: true, cached: true, result: cached.analysis_result });
    }

    const result = analyzeExistingName(body);

    // 사주 없는 결과만 캐시 저장
    if (!body.birthInfo) {
      await supabase.from("naming_analysis_cache").upsert({
        name_hangul: body.nameHangul,
        strokes_list: body.strokesList,
        analysis_result: result,
      });
    }

    return NextResponse.json({ ok: true, cached: false, result });
  } catch (err: any) {
    console.error("[naming/analyze]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
