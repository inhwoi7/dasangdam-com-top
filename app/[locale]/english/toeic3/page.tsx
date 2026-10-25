// app/[locale]/english/toeic3/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Headphones } from "lucide-react";
import {
  P3_KINDS,
  P3_LABEL,
  GRAMMAR,
  EXPR_CARDS,
  REASONS,
  QUESTIONS,
  formatP3No,
  isP3Kind,
  type P3Kind,
} from "@/lib/toeicPart3";
import { useToeic3Progress } from "@/lib/useToeic3Progress";

interface Item {
  no: number;
  group: string;
  label: string;
  chip?: string;
}

const HINTS: Record<P3Kind, string> = {
  grammar: "한글 문장을 보고 영어로 먼저 말해 본 뒤, 카드를 눌러 확인하세요.",
  expr: "한글 단어를 보고 영어 표현과 예문을 먼저 떠올려 보세요.",
  reason: "이유를 말할 때 바로 쓰는 만능 문장이에요. 입에 붙을 때까지 반복하세요.",
  question:
    "질문과 한글 힌트를 보고 제한 시간 안에 말해 본 뒤, 모범 답변을 확인하세요.",
};

function buildItems(kind: P3Kind): Item[] {
  if (kind === "question") {
    return QUESTIONS.map((q) => ({
      no: q.no,
      group: q.group,
      label: q.question,
      chip: `${q.seconds}초`,
    }));
  }
  const list = kind === "grammar" ? GRAMMAR : kind === "expr" ? EXPR_CARDS : REASONS;
  return list.map((c) => ({
    no: c.no,
    group: c.group,
    label: c.ko,
    chip: kind === "grammar" ? c.tag : undefined,
  }));
}

export default function Toeic3HomePage() {
  const { locale } = useParams<{ locale: string }>();
  const base = `/${locale}/english`;

  const [tab, setTab] = useState<P3Kind>("grammar");
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // 항상 4개를 호출해야 해서(훅 규칙) 모두 불러오고 현재 탭 것만 사용
  const pGrammar = useToeic3Progress("grammar");
  const pExpr = useToeic3Progress("expr");
  const pReason = useToeic3Progress("reason");
  const pQuestion = useToeic3Progress("question");
  const progress =
    tab === "grammar"
      ? pGrammar
      : tab === "expr"
        ? pExpr
        : tab === "reason"
          ? pReason
          : pQuestion;

  // 상세 페이지에서 "목차"로 돌아올 때 보던 탭 유지 (?tab=question 등)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && isP3Kind(t)) setTab(t);
  }, []);

  const switchTab = (t: P3Kind) => {
    setTab(t);
    setOpenGroup(null);
    window.history.replaceState(null, "", `?tab=${t}`);
  };

  const groups = useMemo(() => {
    const items = buildItems(tab);
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const list = map.get(it.group) ?? [];
      list.push(it);
      map.set(it.group, list);
    }
    return [...map.entries()];
  }, [tab]);

  const total = buildItems(tab).length;
  const done = progress.loaded ? progress.mastered.size : 0;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-10 pt-5">
      <header className="mb-4">
        <Link
          href={base}
          className="mb-3 flex w-fit items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          영어 학습
        </Link>

        <div className="flex items-center gap-1.5 text-rose-600">
          <Headphones className="h-4 w-4" />
          <span className="text-[11px] font-semibold tracking-widest">
            TOEIC SPEAKING
          </span>
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          Part 3 · 160점 목표
        </h1>

        {/* 탭 (2 x 2) */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1">
          {P3_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => switchTab(k)}
              aria-pressed={tab === k}
              className={[
                "rounded-xl py-2 text-sm font-semibold transition-colors",
                tab === k
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              {P3_LABEL[k]}
            </button>
          ))}
        </div>

        {/* 진행률 */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500">
            {done}/{total}
          </span>
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          {HINTS[tab]}
        </p>
      </header>

      {/* 그룹 아코디언 */}
      <section className="space-y-2">
        {groups.map(([group, items], idx) => {
          const isOpen = openGroup === group;
          const groupDone = progress.loaded
            ? items.filter((it) => progress.isMastered(it.no)).length
            : 0;

          return (
            <div
              key={group}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70"
            >
              <button
                type="button"
                onClick={() => setOpenGroup((cur) => (cur === group ? null : group))}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-sm font-bold text-rose-700">
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    {group}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-medium text-slate-400">
                  {groupDone}/{items.length}
                </span>
                <ChevronDown
                  className={[
                    "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
                    isOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              <div
                className={[
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <ul className="overflow-hidden border-t border-slate-100">
                  {items.map((it) => {
                    const isDone = progress.loaded && progress.isMastered(it.no);
                    return (
                      <li
                        key={it.no}
                        className="flex items-center gap-1.5 border-b border-slate-50 px-1.5 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => progress.toggle(it.no)}
                          aria-pressed={isDone}
                          aria-label={`${formatP3No(it.no)} 마스터 표시`}
                          className={[
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                            isDone
                              ? "border-rose-500 bg-rose-500 text-white"
                              : "border-slate-300 bg-white text-transparent hover:border-rose-400",
                          ].join(" ")}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </button>

                        <Link
                          href={`${base}/toeic3/${tab}/${it.no}`}
                          className="flex flex-1 items-center gap-2.5 rounded-lg px-1.5 py-2 transition-colors hover:bg-slate-50 active:bg-slate-100"
                        >
                          <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                            {formatP3No(it.no)}
                          </span>
                          <span
                            className={[
                              "flex-1 truncate text-[13px] font-medium",
                              isDone
                                ? "text-slate-400 line-through"
                                : "text-slate-800",
                            ].join(" ")}
                          >
                            {it.label}
                          </span>
                          {it.chip && (
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              {it.chip}
                            </span>
                          )}
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
