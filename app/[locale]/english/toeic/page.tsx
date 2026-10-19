// app/[locale]/english/toeic/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Mic } from "lucide-react";
import {
  EXPRESSIONS,
  EXPRESSION_CATEGORIES,
  SETS,
  SET_CATEGORIES,
  formatToeicNo,
} from "@/lib/toeicPart2";
import { useToeicProgress } from "@/lib/useToeicProgress";

type Tab = "expr" | "set";

export default function ToeicHomePage() {
  const { locale } = useParams<{ locale: string }>();
  const base = `/${locale}/english`;

  const [tab, setTab] = useState<Tab>("expr");
  const [openCat, setOpenCat] = useState<string | null>(null);

  const expr = useToeicProgress("expr");
  const sets = useToeicProgress("set");
  const progress = tab === "expr" ? expr : sets;

  // 상세 페이지에서 "목차"로 돌아올 때 보던 탭 유지 (?tab=set)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "set") setTab("set");
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t);
    setOpenCat(null);
    window.history.replaceState(null, "", `?tab=${t}`);
  };

  const groups = useMemo(() => {
    if (tab === "expr") {
      return EXPRESSION_CATEGORIES.map((cat) => ({
        cat,
        items: EXPRESSIONS.filter((e) => e.category === cat).map((e) => ({
          no: e.no,
          label: e.ko,
        })),
      }));
    }
    return SET_CATEGORIES.map((cat) => ({
      cat,
      items: SETS.filter((s) => s.category === cat).map((s) => ({
        no: s.no,
        label: s.situation_ko,
      })),
    }));
  }, [tab]);

  const total = tab === "expr" ? EXPRESSIONS.length : SETS.length;
  const done = progress.loaded ? progress.mastered.size : 0;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const detailBase = `${base}/toeic/${tab === "expr" ? "expressions" : "sets"}`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-10 pt-5">
      <header className="mb-4">
        <Link
          href={base}
          className="mb-3 flex w-fit items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          영어 구문 학습
        </Link>

        <div className="flex items-center gap-1.5 text-amber-600">
          <Mic className="h-4 w-4" />
          <span className="text-[11px] font-semibold tracking-widest">
            TOEIC SPEAKING
          </span>
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          Part 2 사진 묘사
        </h1>

        {/* 탭 */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1">
          <TabButton active={tab === "expr"} onClick={() => switchTab("expr")}>
            필수 표현 100선
          </TabButton>
          <TabButton active={tab === "set"} onClick={() => switchTab("set")}>
            실전 답변 100세트
          </TabButton>
        </div>

        {/* 진행률 */}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500">
            {done}/{total}
          </span>
        </div>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          {tab === "expr"
            ? "한글 뜻을 보고 영어 표현을 먼저 떠올려 본 뒤, 카드를 눌러 확인하세요."
            : "사진 상황을 보고 30초 안에 직접 말해 본 뒤, 모범 스크립트를 확인하세요."}
        </p>
      </header>

      {/* 카테고리 아코디언 */}
      <section className="space-y-2">
        {groups.map(({ cat, items }, idx) => {
          const isOpen = openCat === cat;
          const catDone = progress.loaded
            ? items.filter((it) => progress.isMastered(it.no)).length
            : 0;

          return (
            <div
              key={cat}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70"
            >
              <button
                type="button"
                onClick={() => setOpenCat((cur) => (cur === cat ? null : cat))}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-sm font-bold text-amber-700">
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    {cat}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-medium text-slate-400">
                  {catDone}/{items.length}
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
                          aria-label={`${formatToeicNo(it.no)} 마스터 표시`}
                          className={[
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                            isDone
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-slate-300 bg-white text-transparent hover:border-amber-400",
                          ].join(" ")}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </button>

                        <Link
                          href={`${detailBase}/${it.no}`}
                          className="flex flex-1 items-center gap-2.5 rounded-lg px-1.5 py-2 transition-colors hover:bg-slate-50 active:bg-slate-100"
                        >
                          <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                            {formatToeicNo(it.no)}
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-xl py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
