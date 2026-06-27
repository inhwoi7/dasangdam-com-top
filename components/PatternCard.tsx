// components/PatternCard.tsx
"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { formatNo } from "@/lib/patterns";

interface PatternCardProps {
  id: number;
  patternKo: string;
  patternEn: string;
  /** 현재 구문이 바뀌면 카드 뒷면 상태를 자동으로 초기화하기 위한 키 */
  resetKey?: number;
}

/**
 * 플래시 카드.
 * - 앞면: 번호 + 한국어 뜻 (먼저 떠올려보기)
 * - 탭/클릭하면 3D 플립으로 영어 패턴이 노출됨
 */
export default function PatternCard({
  id,
  patternKo,
  patternEn,
  resetKey,
}: PatternCardProps) {
  const [flipped, setFlipped] = useState(false);

  // 구문이 바뀌면 다시 한국어 면부터 보이도록 초기화
  useEffect(() => {
    setFlipped(false);
  }, [resetKey, id]);

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      aria-pressed={flipped}
      aria-label={`구문 ${formatNo(id)} 카드 뒤집기`}
      className="group w-full [perspective:1400px] focus:outline-none"
    >
      <div
        className={[
          "relative h-56 w-full rounded-3xl transition-transform duration-500 ease-out",
          "[transform-style:preserve-3d]",
          "motion-reduce:transition-none",
          flipped ? "[transform:rotateY(180deg)]" : "",
        ].join(" ")}
      >
        {/* 앞면 — 한국어 뜻 */}
        <Face className="bg-white ring-1 ring-slate-200/80">
          <span className="text-xs font-semibold tracking-widest text-slate-400">
            NO. {formatNo(id)}
          </span>
          <p className="mt-4 px-2 text-center text-2xl font-bold leading-snug text-slate-800">
            {patternKo}
          </p>
          <Hint label="탭하여 영어 패턴 보기" />
        </Face>

        {/* 뒷면 — 영어 패턴 */}
        <Face className="[transform:rotateY(180deg)] bg-gradient-to-br from-teal-600 to-emerald-600 ring-1 ring-teal-500/30">
          <span className="text-xs font-semibold tracking-widest text-teal-50/80">
            NO. {formatNo(id)}
          </span>
          <p className="mt-4 px-2 text-center text-3xl font-extrabold leading-snug text-white">
            {patternEn}
          </p>
          <Hint label="탭하여 뜻 다시 보기" tone="light" />
        </Face>
      </div>
    </button>
  );
}

/* ---------- 내부 헬퍼 컴포넌트 ---------- */

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
  const color = tone === "light" ? "text-teal-50/70" : "text-slate-400";
  return (
    <span
      className={`absolute bottom-4 flex items-center gap-1 text-[11px] font-medium ${color}`}
    >
      <RotateCw className="h-3 w-3" />
      {label}
    </span>
  );
}
