// app/[locale]/english/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, ChevronRight, FlaskConical, Headphones, Languages, Mic } from "lucide-react";
import { PATTERNS } from "@/lib/patterns";
import { useMastered } from "@/lib/useMastered";

export default function EnglishHubPage() {
  const { locale } = useParams<{ locale: string }>();
  const base = `/${locale}/english`;

  const { mastered, loaded } = useMastered();
  const total = PATTERNS.length;
  const done = loaded ? mastered.size : 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-4 pb-10 pt-5">
      <header className="mb-5">
        <div className="flex items-center gap-1.5 text-teal-600">
          <Languages className="h-4 w-4" />
          <span className="text-[11px] font-semibold tracking-widest">
            ENGLISH STUDY
          </span>
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          나만의 영어 구문 노트
        </h1>
        <p className="mt-1 text-xs text-slate-400">학습할 코너를 골라주세요.</p>
      </header>

      <section className="space-y-2.5">
        {/* 필수 영어회화구문 140개 */}
        <CornerCard
          href={`${base}/patterns`}
          color="bg-teal-600 hover:bg-teal-700 active:bg-teal-800"
          subColor="text-teal-50"
          icon={<BookOpen className="h-4 w-4" />}
          title="필수 영어회화구문 140개"
          subtitle={`플래시카드 · 7개 챕터 · ${done}/${total} 마스터`}
        />

        {/* 고전압 절연 기술영어 */}
        <CornerCard
          href={`${base}/tech`}
          color="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
          subColor="text-indigo-100"
          icon={<FlaskConical className="h-4 w-4" />}
          title="고전압 절연 기술영어 치트시트"
          subtitle="회의 · 논문 발표용 4주 / 2주 완성 플랜"
        />

        {/* TOEIC Speaking Part 2 */}
        <CornerCard
          href={`${base}/toeic`}
          color="bg-amber-500 hover:bg-amber-600 active:bg-amber-700"
          subColor="text-amber-50"
          icon={<Mic className="h-4 w-4" />}
          title="TOEIC Speaking Part 2"
          subtitle="사진 묘사 필수 표현 100선 · 실전 답변 100세트"
        />

        {/* TOEIC Speaking Part 3 */}
        <CornerCard
          href={`${base}/toeic3`}
          color="bg-rose-500 hover:bg-rose-600 active:bg-rose-700"
          subColor="text-rose-50"
          icon={<Headphones className="h-4 w-4" />}
          title="TOEIC Speaking Part 3"
          subtitle="160점 목표 · 문법·표현·이유 150개 + 실전 질문 100"
        />
      </section>
    </main>
  );
}

function CornerCard({
  href,
  color,
  subColor,
  icon,
  title,
  subtitle,
}: {
  href: string;
  color: string;
  subColor: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-2xl p-4 text-white shadow-sm transition-colors",
        color,
      ].join(" ")}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span className={["mt-0.5 block text-xs", subColor].join(" ")}>
          {subtitle}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0" />
    </Link>
  );
}
