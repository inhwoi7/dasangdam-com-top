// app/[locale]/english/toeic/sets/[no]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  SETS,
  getSet,
  getExpression,
  formatToeicNo,
} from "@/lib/toeicPart2";
import { useToeicProgress } from "@/lib/useToeicProgress";

const TOTAL_SECONDS = 30;

export default function ToeicSetPage() {
  const { locale, no } = useParams<{ locale: string; no: string }>();
  const base = `/${locale}/english`;
  const setNo = Number(no);

  const router = useRouter();
  const { isMastered, toggle, loaded } = useToeicProgress("set");
  const [showScript, setShowScript] = useState(false);

  const current = getSet(setNo);

  // 세트가 바뀌면 모범 스크립트는 다시 가려둠
  useEffect(() => {
    setShowScript(false);
  }, [setNo]);

  const { prev, next } = useMemo(() => {
    const idx = SETS.findIndex((s) => s.no === setNo);
    return {
      prev: idx > 0 ? SETS[idx - 1] : null,
      next: idx >= 0 && idx < SETS.length - 1 ? SETS[idx + 1] : null,
    };
  }, [setNo]);

  if (!current) notFound();

  const done = loaded && isMastered(setNo);
  const sentences =
    current.script.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ??
    [current.script];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`${base}/toeic?tab=set`}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          목차
        </Link>
        <span className="text-xs font-semibold tracking-widest text-slate-400">
          SET NO. {formatToeicNo(current.no)}
        </span>
      </div>

      {/* 사진 상황 */}
      <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/80">
        <span className="text-[11px] font-semibold tracking-widest text-amber-600">
          {current.category}
        </span>
        <p className="mt-3 text-2xl font-bold leading-snug text-slate-800">
          {current.situation_ko}
        </p>
        <p className="mt-2 text-[11px] text-slate-400">
          이 상황을 30초 안에 영어로 말해 보세요.
        </p>
      </section>

      {/* 30초 스톱워치 */}
      <Stopwatch resetKey={setNo} />

      {/* 힌트: 조합 구문 */}
      <section className="mt-6">
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500">
          조합 구문 힌트
        </h2>
        <ul className="space-y-1.5">
          {current.combo.map((n) => {
            const e = getExpression(n);
            return (
              <li key={n}>
                <Link
                  href={`${base}/toeic/expressions/${n}`}
                  className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200/70 transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                    {formatToeicNo(n)}
                  </span>
                  <span className="flex-1 truncate text-[12.5px] text-slate-700">
                    {e ? e.ko : `구문 ${n}`}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 나의 영작 연습 */}
      <section className="mt-6">
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500">
          나의 영작 연습
        </h2>
        <textarea
          key={setNo}
          rows={4}
          placeholder="여기에 직접 영어로 써 보세요 (저장되지 않아요)"
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-amber-400 focus:outline-none"
        />
      </section>

      {/* 모범 스크립트 */}
      <button
        type="button"
        onClick={() => setShowScript((v) => !v)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900 active:bg-slate-700"
      >
        {showScript ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        {showScript ? "모범 스크립트 가리기" : "모범 스크립트 보기"}
      </button>

      {showScript && (
        <section className="mt-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 shadow-lg shadow-orange-200/60">
          <div className="space-y-2">
            {sentences.map((s, i) => (
              <p
                key={i}
                className="text-[15px] font-semibold leading-relaxed text-white"
              >
                {s}
              </p>
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => toggle(setNo)}
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

      <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <NavButton
            direction="prev"
            disabled={!prev}
            onClick={() => prev && router.push(`${base}/toeic/sets/${prev.no}`)}
          />
          <NavButton
            direction="next"
            disabled={!next}
            onClick={() => next && router.push(`${base}/toeic/sets/${next.no}`)}
          />
        </div>
      </nav>
    </main>
  );
}

/* ---------- 30초 스톱워치 ---------- */

function Stopwatch({ resetKey }: { resetKey: number }) {
  const [left, setLeft] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);

  // 세트가 바뀌면 초기화
  useEffect(() => {
    setLeft(TOTAL_SECONDS);
    setRunning(false);
  }, [resetKey]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // 0초가 되면 자동 정지
  useEffect(() => {
    if (running && left === 0) setRunning(false);
  }, [left, running]);

  const start = () => {
    if (left === 0) setLeft(TOTAL_SECONDS);
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setLeft(TOTAL_SECONDS);
  };

  const urgent = running && left <= 5;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <section className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200/70">
      <span
        className={[
          "w-24 text-center text-3xl font-extrabold tabular-nums transition-colors",
          urgent ? "text-rose-500" : "text-slate-800",
        ].join(" ")}
      >
        {mm}:{ss}
      </span>

      <button
        type="button"
        onClick={running ? () => setRunning(false) : start}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 active:bg-amber-700"
      >
        {running ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {running ? "일시정지" : left === 0 ? "다시 시작" : "시작"}
      </button>

      <button
        type="button"
        onClick={reset}
        aria-label="타이머 초기화"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </section>
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
      <span>{isPrev ? "이전 세트" : "다음 세트"}</span>
      {!isPrev && <ChevronRight className="h-4 w-4" />}
    </button>
  );
}
