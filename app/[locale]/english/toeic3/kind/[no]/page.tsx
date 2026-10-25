// app/[locale]/english/toeic3/[kind]/[no]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import {
  P3_LABEL,
  QUESTIONS,
  formatP3No,
  getCards,
  isP3Kind,
  type P3CardKind,
} from "@/lib/toeicPart3";
import { useToeic3Progress } from "@/lib/useToeic3Progress";

export default function Toeic3StudyPage() {
  const { locale, kind, no } = useParams<{
    locale: string;
    kind: string;
    no: string;
  }>();
  const n = Number(no);

  if (!isP3Kind(kind)) notFound();
  if (kind === "question") return <QuestionView locale={locale} no={n} />;
  return <CardView locale={locale} kind={kind} no={n} />;
}

/* =====================  카드형 (문법 · 필수표현 · 만능이유)  ===================== */

function CardView({
  locale,
  kind,
  no,
}: {
  locale: string;
  kind: P3CardKind;
  no: number;
}) {
  const base = `/${locale}/english/toeic3`;
  const router = useRouter();
  const { isMastered, toggle, loaded } = useToeic3Progress(kind);

  const list = getCards(kind);
  const idx = list.findIndex((c) => c.no === no);
  const card = idx >= 0 ? list[idx] : undefined;
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;

  if (!card) notFound();

  const done = loaded && isMastered(no);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`${base}?tab=${kind}`}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          목차
        </Link>
        <span className="text-xs font-semibold tracking-widest text-slate-400">
          {P3_LABEL[kind]} · NO. {formatP3No(card.no)}
        </span>
      </div>

      <FlipCard
        no={card.no}
        tag={card.tag}
        ko={card.ko}
        en={card.en}
        resetKey={`${kind}-${card.no}`}
      />

      <MasterButton done={done} onClick={() => toggle(no)} />

      <BottomNav
        prevLabel="이전"
        nextLabel="다음"
        onPrev={prev ? () => router.push(`${base}/${kind}/${prev.no}`) : undefined}
        onNext={next ? () => router.push(`${base}/${kind}/${next.no}`) : undefined}
      />
    </main>
  );
}

function FlipCard({
  no,
  tag,
  ko,
  en,
  resetKey,
}: {
  no: number;
  tag: string;
  ko: string;
  en: string;
  resetKey: string;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [resetKey]);

  const [first, ...rest] = en.split("\n");

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      aria-pressed={flipped}
      aria-label={`${formatP3No(no)}번 카드 뒤집기`}
      className="group w-full [perspective:1400px] focus:outline-none"
    >
      <div
        className={[
          "relative h-64 w-full rounded-3xl transition-transform duration-500 ease-out",
          "[transform-style:preserve-3d]",
          "motion-reduce:transition-none",
          flipped ? "[transform:rotateY(180deg)]" : "",
        ].join(" ")}
      >
        {/* 앞면 — 한글 */}
        <Face className="bg-white ring-1 ring-slate-200/80">
          <span className="text-xs font-semibold tracking-widest text-slate-400">
            NO. {formatP3No(no)}
          </span>
          <span className="mt-3 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600">
            {tag}
          </span>
          <p className="mt-4 px-2 text-center text-2xl font-bold leading-snug text-slate-800">
            {ko}
          </p>
          <Hint label="탭하여 영어 보기" />
        </Face>

        {/* 뒷면 — 영어 (여러 줄이면 첫 줄은 크게, 나머지는 예문) */}
        <Face className="[transform:rotateY(180deg)] bg-gradient-to-br from-rose-500 to-pink-600 ring-1 ring-rose-400/30">
          <span className="text-xs font-semibold tracking-widest text-rose-50/80">
            NO. {formatP3No(no)}
          </span>
          <p
            className={[
              "mt-4 px-2 text-center font-extrabold leading-snug text-white",
              first.length > 36 ? "text-xl" : "text-2xl",
            ].join(" ")}
          >
            {first}
          </p>
          {rest.map((line, i) => (
            <p
              key={i}
              className="mt-3 px-2 text-center text-base font-medium leading-relaxed text-rose-50"
            >
              {line}
            </p>
          ))}
          <Hint label="탭하여 한글 다시 보기" tone="light" />
        </Face>
      </div>
    </button>
  );
}

function Face({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-6 shadow-lg shadow-slate-200/60",
        "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
        "transition-shadow group-active:shadow-md",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Hint({
  label,
  tone = "dark",
}: {
  label: string;
  tone?: "dark" | "light";
}) {
  const color = tone === "light" ? "text-rose-50/70" : "text-slate-400";
  return (
    <span
      className={`absolute bottom-4 flex items-center gap-1 text-[11px] font-medium ${color}`}
    >
      <RotateCw className="h-3 w-3" />
      {label}
    </span>
  );
}

/* =====================  실전 질문 (제한 시간 연습)  ===================== */

function QuestionView({ locale, no }: { locale: string; no: number }) {
  const base = `/${locale}/english/toeic3`;
  const router = useRouter();
  const { isMastered, toggle, loaded } = useToeic3Progress("question");
  const [showAnswer, setShowAnswer] = useState(false);

  const idx = QUESTIONS.findIndex((q) => q.no === no);
  const q = idx >= 0 ? QUESTIONS[idx] : undefined;
  const prev = idx > 0 ? QUESTIONS[idx - 1] : null;
  const next = idx >= 0 && idx < QUESTIONS.length - 1 ? QUESTIONS[idx + 1] : null;

  // 질문이 바뀌면 모범 답변은 다시 가려둠
  useEffect(() => {
    setShowAnswer(false);
  }, [no]);

  if (!q) notFound();

  const done = loaded && isMastered(no);
  const sentences =
    q.answer.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [q.answer];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`${base}?tab=question`}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          목차
        </Link>
        <span className="text-xs font-semibold tracking-widest text-slate-400">
          QUESTION NO. {formatP3No(q.no)}
        </span>
      </div>

      {/* 질문 + 한글 힌트 */}
      <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-widest text-rose-600">
            {q.group}
          </span>
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
            {q.seconds}초
          </span>
        </div>
        <p className="mt-3 text-xl font-bold leading-snug text-slate-800">
          {q.question}
        </p>
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[13px] leading-relaxed text-slate-500">
          {q.hint_ko}
        </p>
      </section>

      {/* 제한 시간 스톱워치 */}
      <Stopwatch total={q.seconds} resetKey={`${q.no}`} />

      {/* 나의 영작 연습 */}
      <section className="mt-6">
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-500">
          나의 답변 연습
        </h2>
        <textarea
          key={q.no}
          rows={4}
          placeholder="여기에 직접 영어로 써 보세요 (저장되지 않아요)"
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-rose-400 focus:outline-none"
        />
      </section>

      {/* 모범 답변 */}
      <button
        type="button"
        onClick={() => setShowAnswer((v) => !v)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900 active:bg-slate-700"
      >
        {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {showAnswer ? "모범 답변 가리기" : "모범 답변 보기"}
      </button>

      {showAnswer && (
        <section className="mt-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 shadow-lg shadow-rose-200/60">
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

      <MasterButton done={done} onClick={() => toggle(no)} />

      <BottomNav
        prevLabel="이전 질문"
        nextLabel="다음 질문"
        onPrev={prev ? () => router.push(`${base}/question/${prev.no}`) : undefined}
        onNext={next ? () => router.push(`${base}/question/${next.no}`) : undefined}
      />
    </main>
  );
}

function Stopwatch({ total, resetKey }: { total: number; resetKey: string }) {
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);

  // 질문이 바뀌거나 제한 시간이 달라지면 초기화
  useEffect(() => {
    setLeft(total);
    setRunning(false);
  }, [resetKey, total]);

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
    if (left === 0) setLeft(total);
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setLeft(total);
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
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 active:bg-rose-700"
      >
        {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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

/* =====================  공통 부품  ===================== */

function MasterButton({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors",
        done
          ? "bg-rose-500 text-white hover:bg-rose-600"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      <Check className="h-4 w-4" strokeWidth={3} />
      {done ? "마스터 완료" : "마스터로 표시"}
    </button>
  );
}

function BottomNav({
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
}: {
  prevLabel: string;
  nextLabel: string;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <NavButton direction="prev" label={prevLabel} onClick={onPrev} />
        <NavButton direction="next" label={nextLabel} onClick={onNext} />
      </div>
    </nav>
  );
}

function NavButton({
  direction,
  label,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  onClick?: () => void;
}) {
  const isPrev = direction === "prev";
  const disabled = !onClick;
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
      <span>{label}</span>
      {!isPrev && <ChevronRight className="h-4 w-4" />}
    </button>
  );
}
