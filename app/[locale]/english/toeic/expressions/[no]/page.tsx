// app/[locale]/english/toeic/expressions/[no]/page.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from "lucide-react";
import PatternCard from "@/components/PatternCard";
import {
  EXPRESSIONS,
  SETS,
  getExpression,
  formatToeicNo,
} from "@/lib/toeicPart2";
import { useToeicProgress } from "@/lib/useToeicProgress";

export default function ToeicExpressionPage() {
  const { locale, no } = useParams<{ locale: string; no: string }>();
  const base = `/${locale}/english`;
  const exprNo = Number(no);

  const router = useRouter();
  const { isMastered, toggle, loaded } = useToeicProgress("expr");

  const expr = getExpression(exprNo);

  const { prev, next } = useMemo(() => {
    const idx = EXPRESSIONS.findIndex((e) => e.no === exprNo);
    return {
      prev: idx > 0 ? EXPRESSIONS[idx - 1] : null,
      next:
        idx >= 0 && idx < EXPRESSIONS.length - 1 ? EXPRESSIONS[idx + 1] : null,
    };
  }, [exprNo]);

  // 이 표현이 조합 구문으로 쓰인 사진별 답변 세트
  const relatedSets = useMemo(
    () => SETS.filter((s) => s.combo.includes(exprNo)).slice(0, 8),
    [exprNo]
  );

  if (!expr) notFound();

  const done = loaded && isMastered(exprNo);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`${base}/toeic?tab=expr`}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          목차
        </Link>
        <span className="text-xs font-semibold tracking-widest text-slate-400">
          {expr.category} · NO. {formatToeicNo(expr.no)}
        </span>
      </div>

      <PatternCard
        id={expr.no}
        patternKo={expr.ko}
        patternEn={expr.en}
        resetKey={expr.no}
      />

      <button
        type="button"
        onClick={() => toggle(expr.no)}
        className={[
          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors",
          done
            ? "bg-amber-500 text-white hover:bg-amber-600"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
        ].join(" ")}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        {done ? "마스터 완료" : "마스터로 표시"}
      </button>

      {relatedSets.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 px-1 text-sm font-semibold text-slate-500">
            이 표현이 쓰인 사진 답변
          </h2>
          <ul className="space-y-2">
            {relatedSets.map((s) => (
              <li key={s.no}>
                <Link
                  href={`${base}/toeic/sets/${s.no}`}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 ring-1 ring-slate-200/70 transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                    {formatToeicNo(s.no)}
                  </span>
                  <span className="flex-1 truncate text-[13px] font-medium text-slate-800">
                    {s.situation_ko}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <NavButton
            direction="prev"
            disabled={!prev}
            onClick={() =>
              prev && router.push(`${base}/toeic/expressions/${prev.no}`)
            }
          />
          <NavButton
            direction="next"
            disabled={!next}
            onClick={() =>
              next && router.push(`${base}/toeic/expressions/${next.no}`)
            }
          />
        </div>
      </nav>
    </main>
  );
}

function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold transition-colors",
        disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-300"
          : "bg-slate-800 text-white hover:bg-slate-900 active:bg-slate-700",
      ].join(" ")}
    >
      {isPrev && <ChevronLeft className="h-4 w-4" />}
      <span>{isPrev ? "이전 표현" : "다음 표현"}</span>
      {!isPrev && <ChevronRight className="h-4 w-4" />}
    </button>
  );
}
