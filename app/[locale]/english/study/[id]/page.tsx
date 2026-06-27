// app/[locale]/english/study/[id]/page.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from "lucide-react";
import PatternCard from "@/components/PatternCard";
import DialogueLine from "@/components/DialogueLine";
import { ORDERED_PATTERNS, getPatternById, formatNo } from "@/lib/patterns";
import { useMastered } from "@/lib/useMastered";

export default function StudyPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const base = `/${locale}/english`;
  const patternId = Number(id);

  const router = useRouter();
  const { isMastered, toggle, loaded } = useMastered();

  const pattern = getPatternById(patternId);

  const { prev, next } = useMemo(() => {
    const idx = ORDERED_PATTERNS.findIndex((p) => p.id === patternId);
    return {
      prev: idx > 0 ? ORDERED_PATTERNS[idx - 1] : null,
      next:
        idx >= 0 && idx < ORDERED_PATTERNS.length - 1
          ? ORDERED_PATTERNS[idx + 1]
          : null,
    };
  }, [patternId]);

  if (!pattern) notFound();

  const done = loaded && isMastered(patternId);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={base}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          목차
        </Link>
        <span className="text-xs font-semibold tracking-widest text-slate-400">
          Chapter {pattern.chapter_num} · NO. {formatNo(pattern.id)}
        </span>
      </div>

      <PatternCard
        id={pattern.id}
        patternKo={pattern.pattern_ko}
        patternEn={pattern.pattern_en}
        resetKey={pattern.id}
      />

      <button
        type="button"
        onClick={() => toggle(pattern.id)}
        className={[
          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors",
          done
            ? "bg-teal-500 text-white hover:bg-teal-600"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
        ].join(" ")}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        {done ? "마스터 완료" : "마스터로 표시"}
      </button>

      <section className="mt-8">
        <h2 className="mb-3 px-1 text-sm font-semibold text-slate-500">
          예시 대화
        </h2>
        <div className="space-y-2">
          {pattern.example_dialogue.map((line, i) => (
            <DialogueLine key={i} line={line} />
          ))}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <NavButton
            direction="prev"
            disabled={!prev}
            onClick={() => prev && router.push(`${base}/study/${prev.id}`)}
          />
          <NavButton
            direction="next"
            disabled={!next}
            onClick={() => next && router.push(`${base}/study/${next.id}`)}
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
      <span>{isPrev ? "이전 구문" : "다음 구문"}</span>
      {!isPrev && <ChevronRight className="h-4 w-4" />}
    </button>
  );
}