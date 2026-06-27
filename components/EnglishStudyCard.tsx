// components/EnglishStudyCard.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Languages, ArrowRight } from "lucide-react";

/**
 * 홈 "오늘은 뭐가 궁금하세요?" 그리드에 넣는 카드.
 * 사주/타로 카드와 같은 형태(아이콘 박스 + 제목 + 설명 + 화살표).
 * 현재 locale을 자동으로 읽어 /ko/english · /en/english 로 이동한다.
 */
export default function EnglishStudyCard() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "ko";

  return (
    <Link
      href={`/${locale}/english`}
      className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-500">
        <Languages className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-slate-800">영어 구문 학습</span>
        <span className="mt-1 block text-sm leading-relaxed text-slate-400">
          필수 회화 구문 140개를 플래시카드로 자투리 시간에 익혀보세요.
        </span>
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-teal-300 group-hover:text-teal-500">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
