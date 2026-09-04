// app/[locale]/english/tech/[deckId]/[day]/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, BookMarked } from "lucide-react";
import {
  getTechDeck,
  getTechDay,
  DECK_FIELD_GRADING,
  DECK_SATURATION,
  DECK_FIELD_GRADING_CORE_SENTENCES,
  DECK_FIELD_GRADING_FORMULAS,
  DECK_SATURATION_CORE_SENTENCES,
  DECK_SATURATION_QNA,
  DECK_SATURATION_VARS,
  DECK_SATURATION_TAKEAWAY,
} from "@/lib/techEnglish";

export default function TechDayPage() {
  const { locale, deckId, day } = useParams<{
    locale: string;
    deckId: string;
    day: string;
  }>();
  const base = `/${locale}/english/tech`;
  const dayId = Number(day);
  const router = useRouter();

  const deck = getTechDeck(deckId);
  const dayData = getTechDay(deckId, dayId);
  if (!deck || !dayData) notFound();

  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const toggleVocab = (i: number) =>
    setFlipped((p) => ({ ...p, [i]: !p[i] }));

  const isLastDay = dayId === deck.days.length;
  const isFirstDay = dayId === 1;

  // 마지막 Day에서만 부록(핵심 문장·공식·Q&A) 노출
  const appendix = useMemo(() => {
    if (!isLastDay) return null;
    if (deck.id === DECK_FIELD_GRADING.id) {
      return { core: DECK_FIELD_GRADING_CORE_SENTENCES, formulas: DECK_FIELD_GRADING_FORMULAS };
    }
    if (deck.id === DECK_SATURATION.id) {
      return {
        core: DECK_SATURATION_CORE_SENTENCES,
        qna: DECK_SATURATION_QNA,
        vars: DECK_SATURATION_VARS,
        takeaway: DECK_SATURATION_TAKEAWAY,
      };
    }
    return null;
  }, [isLastDay, deck.id]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-24 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={base}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          치트시트 목차
        </Link>
        <span className="text-xs font-semibold tracking-widest text-slate-400">
          Week {dayData.week} · Day {dayData.id}/{deck.days.length}
        </span>
      </div>

      {/* 오늘의 문장 패턴 */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-200/60">
        <span className="text-[11px] font-semibold tracking-widest text-indigo-100">
          오늘의 문장 구조
        </span>
        <p className="mt-2 text-xl font-extrabold leading-snug">
          {dayData.pattern_en}
        </p>
        <p className="mt-1 text-sm text-indigo-100">{dayData.pattern_ko}</p>
      </section>

      {/* 핵심 단어 */}
      <section className="mt-5">
        <h2 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-500">
          <BookMarked className="h-4 w-4" />
          핵심 단어 ({dayData.vocab.length}개)
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {dayData.vocab.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleVocab(i)}
              className="rounded-xl bg-white p-3 text-left ring-1 ring-slate-200/70 transition-colors hover:bg-slate-50 active:bg-slate-100"
            >
              <span className="block text-sm font-semibold text-slate-800">
                {v.en}
              </span>
              <span
                className={[
                  "mt-0.5 block text-xs text-slate-400 transition-opacity",
                  flipped[i] ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                {v.ko}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 회의용 예문 */}
      <section className="mt-5">
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500">
          회의용 예문
        </h2>
        <div className="space-y-2">
          {dayData.examples.map((ex, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-3.5 text-sm font-medium leading-relaxed text-slate-800 ring-1 ring-slate-200/70"
            >
              {ex}
            </div>
          ))}
        </div>
      </section>

      {/* 마지막 Day 부록 */}
      {appendix && (
        <section className="mt-6 space-y-4">
          <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200/70">
            <h3 className="mb-2 text-sm font-bold text-amber-800">
              반드시 외울 핵심 문장
            </h3>
            <ul className="space-y-1.5">
              {appendix.core.map((line, i) => {
                const [en, ko] = line.split(" | ");
                return (
                  <li key={i} className="text-xs leading-relaxed text-amber-900">
                    <span className="font-semibold">{i + 1}. {en}</span>
                    <br />
                    <span className="text-amber-700">{ko}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {"formulas" in appendix && appendix.formulas && (
            <div className="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-200/70">
              <h3 className="mb-2 text-sm font-bold text-sky-800">
                핵심 문장 조합 공식
              </h3>
              <ul className="space-y-2">
                {appendix.formulas.map((f, i) => (
                  <li key={i} className="text-xs leading-relaxed">
                    <span className="font-semibold text-sky-700">{f.label}</span>
                    <br />
                    <span className="text-sky-900">{f.sentence}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {"qna" in appendix && appendix.qna && (
            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200/70">
              <h3 className="mb-2 text-sm font-bold text-emerald-800">
                실전 Q&amp;A 롤플레잉
              </h3>
              <div className="space-y-3">
                {appendix.qna.map((qa, i) => (
                  <div key={i} className="text-xs leading-relaxed">
                    <p className="font-semibold text-emerald-700">
                      Q. {qa.q_en}
                    </p>
                    <p className="text-emerald-600">{qa.q_ko}</p>
                    <p className="mt-1 font-semibold text-emerald-900">
                      A. {qa.a_en}
                    </p>
                    <p className="text-emerald-700">{qa.a_ko}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {"vars" in appendix && appendix.vars && (
            <div className="rounded-2xl bg-slate-100 p-4 ring-1 ring-slate-200">
              <h3 className="mb-2 text-sm font-bold text-slate-700">
                핵심 물리 변수 &amp; 설계 메모
              </h3>
              <ul className="space-y-1">
                {appendix.vars.map((v, i) => (
                  <li key={i} className="text-xs text-slate-700">
                    <span className="font-mono font-semibold">{v.symbol}</span>
                    {" — "}
                    {v.en} ({v.ko})
                  </li>
                ))}
              </ul>
              {"takeaway" in appendix && appendix.takeaway && (
                <p className="mt-3 rounded-lg bg-white p-2.5 text-xs leading-relaxed text-slate-600">
                  💡 {appendix.takeaway}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* 하단 내비게이션 */}
      <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isFirstDay}
            onClick={() => router.push(`${base}/${deckId}/${dayId - 1}`)}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold transition-colors",
              isFirstDay
                ? "cursor-not-allowed bg-slate-100 text-slate-300"
                : "bg-slate-800 text-white hover:bg-slate-900 active:bg-slate-700",
            ].join(" ")}
          >
            <ChevronLeft className="h-4 w-4" />
            이전 Day
          </button>
          <button
            type="button"
            disabled={isLastDay}
            onClick={() => router.push(`${base}/${deckId}/${dayId + 1}`)}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold transition-colors",
              isLastDay
                ? "cursor-not-allowed bg-slate-100 text-slate-300"
                : "bg-slate-800 text-white hover:bg-slate-900 active:bg-slate-700",
            ].join(" ")}
          >
            다음 Day
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </main>
  );
}
