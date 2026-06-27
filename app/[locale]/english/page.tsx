// app/[locale]/english/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, Check, ChevronDown } from "lucide-react";
import {
  PATTERNS,
  CHAPTER_TITLES,
  formatNo,
  type PatternData,
} from "@/lib/patterns";
import { useMastered } from "@/lib/useMastered";

export default function EnglishHomePage() {
  const { locale } = useParams<{ locale: string }>();
  const base = `/${locale}/english`;

  const { isMastered, toggle, mastered, loaded } = useMastered();

  // 단원별로 묶기
  const chapters = useMemo(() => {
    const map = new Map<number, PatternData[]>();
    for (const p of PATTERNS) {
      const list = map.get(p.chapter_num) ?? [];
      list.push(p);
      map.set(p.chapter_num, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  // 한 번에 하나만 펼침. null = 전부 접힘(첫 화면이 한눈에 들어옴)
  const [openCh, setOpenCh] = useState<number | null>(null);
  const toggleChapter = (num: number) =>
    setOpenCh((cur) => (cur === num ? null : num));

  const total = PATTERNS.length;
  const done = loaded ? mastered.size : 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-10 pt-5">
      {/* 헤더 (압축) */}
      <header className="mb-4">
        <div className="flex items-center gap-1.5 text-teal-600">
          <BookOpen className="h-4 w-4" />
          <span className="text-[11px] font-semibold tracking-widest">
            필수회화구문 140
          </span>
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          나만의 영어 구문 노트
        </h1>

        {/* 진행률 (슬림) */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500">
            {done}/{total}
          </span>
        </div>
      </header>

      {/* 단원 아코디언 (전부 접힘 시작 · 단일 오픈) */}
      <section className="space-y-2">
        {chapters.map(([num, list]) => {
          const isOpen = openCh === num;
          const chapterDone = loaded
            ? list.filter((p) => isMastered(p.id)).length
            : 0;

          return (
            <div
              key={num}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70"
            >
              <button
                type="button"
                onClick={() => toggleChapter(num)}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
                  {num}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    Chapter {num}
                  </span>
                  <span className="line-clamp-1 text-[11px] text-slate-400">
                    {CHAPTER_TITLES[num]}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-medium text-slate-400">
                  {chapterDone}/{list.length}
                </span>
                <ChevronDown
                  className={[
                    "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
                    isOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              {/* 펼침 영역 — 부드럽게 열림 */}
              <div
                className={[
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <ul className="overflow-hidden border-t border-slate-100">
                  {list.map((p) => {
                    const isDone = loaded && isMastered(p.id);
                    return (
                      <li
                        key={p.id}
                        className="flex items-center gap-1.5 border-b border-slate-50 px-1.5 last:border-b-0"
                      >
                        {/* 마스터 체크 */}
                        <button
                          type="button"
                          onClick={() => toggle(p.id)}
                          aria-pressed={isDone}
                          aria-label={`구문 ${formatNo(p.id)} 마스터 표시`}
                          className={[
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                            isDone
                              ? "border-teal-500 bg-teal-500 text-white"
                              : "border-slate-300 bg-white text-transparent hover:border-teal-400",
                          ].join(" ")}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </button>

                        {/* 구문 → 상세 */}
                        <Link
                          href={`${base}/study/${p.id}`}
                          className="flex flex-1 items-center gap-2.5 rounded-lg px-1.5 py-2 transition-colors hover:bg-slate-50 active:bg-slate-100"
                        >
                          <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                            {formatNo(p.id)}
                          </span>
                          <span
                            className={[
                              "flex-1 truncate text-[13px] font-medium",
                              isDone
                                ? "text-slate-400 line-through"
                                : "text-slate-800",
                            ].join(" ")}
                          >
                            {p.pattern_ko}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
