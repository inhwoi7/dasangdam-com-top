// app/api/naming/hanja/route.ts
// 한자 후보 실시간 검색 (셀프 작명 도구에서 사용)
// 예: GET /api/naming/hanja?sound=민&elements=화,목&surnameStrokes=8

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkSuriGilhyung } from "@/lib/naming-logic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sound          = searchParams.get("sound");
  const elementsRaw    = searchParams.get("elements") ?? "";
  const surnameStrokes = parseInt(searchParams.get("surnameStrokes") ?? "0");

  if (!sound) {
    return NextResponse.json({ error: "sound 파라미터 필요" }, { status: 400 });
  }

  const elements = elementsRaw
    ? elementsRaw.split(",").filter(Boolean)
    : ["목", "화", "토", "금", "수"];

  
  const { data, error } = await supabase
    .from("naming_hanja")
    .select("hanja, hangul_sound, strokes_original, five_elements, meaning")
    .eq("hangul_sound", sound)
    .eq("is_legal_name", true)
    .eq("is_forbidden", false)
    .in("five_elements", elements)
    .order("strokes_original")
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 각 한자에 81수 미리보기 추가
  const enriched = (data ?? []).map((h) => ({
    ...h,
    suriPreview: surnameStrokes
      ? checkSuriGilhyung(surnameStrokes + h.strokes_original)
      : null,
  }));

  return NextResponse.json({ ok: true, results: enriched });
}
