// app/[locale]/english/tech/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Briefcase } from "lucide-react";
import { TECH_DECKS } from "@/lib/techEnglish";

export default function TechEnglishHomePage() {
  const { locale } = useParams<{ locale: string }>();
  const base = `/${locale}/english`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-16 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={base}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          영어 구문 학습
        </Link>
      </div>

      <header className="mb-5">
        <div className="flex items-center gap-1.5 text-indigo-600">
          <Briefcase className="h-4 w-4" />
          <span className="text-[11px] font-semibold tracking-widest">
            업무 기술영어
          </span>
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          고전압 절연·전계 완화 치트시트
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          글로벌 미팅 · 논문 발표 핵심 표현
        </p>
      </header>

      <section className="space-y-3">
        {TECH_DECKS.map((deck, i) => (
          <Link
            key={deck.id}
            href={`${base}/tech/${deck.id}/1`}
            className="block overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 transition-colors hover:bg-slate-50 active:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  {deck.subtitle}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  Day 1 ~ {deck.days.length} · 하루 5~8단어 + 문장 패턴
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
