"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useKakaoShare } from "@/lib/useKakaoShare";
import { useLocale } from "next-intl";
import { ArrowLeft, RefreshCw } from "lucide-react";

type Message = {
  id: number;
  category: string;
  philosopher: string;
  quote: string;
  quote_en?: string;
  comment: string;
  comment_en?: string;
  is_active: boolean;
};

const CATEGORIES_KO = ["전체", "자존감", "관계", "커리어", "휴식", "성장", "행복", "인생"];
const CATEGORIES_EN = ["All", "Self-esteem", "Relationship", "Career", "Rest", "Growth", "Happiness", "Life"];

// KO 카테고리명 ↔ EN 카테고리명 매핑
const CAT_KO_TO_EN: Record<string, string> = {
  "전체": "All", "자존감": "Self-esteem", "관계": "Relationship",
  "커리어": "Career", "휴식": "Rest", "성장": "Growth", "행복": "Happiness", "인생": "Life",
};
const CAT_EN_TO_KO: Record<string, string> = Object.fromEntries(
  Object.entries(CAT_KO_TO_EN).map(([k, v]) => [v, k])
);

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  전체: { bg: "bg-zinc-100", text: "text-zinc-700", border: "border-zinc-200", emoji: "✨" },
  자존감: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", emoji: "💜" },
  관계: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", emoji: "🌹" },
  커리어: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", emoji: "🔵" },
  휴식: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", emoji: "🌿" },
  성장: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", emoji: "🌱" },
  행복: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", emoji: "🌟" },
  인생: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200", emoji: "🌊" },
};

// 카테고리 스타일은 항상 KO 키로 조회
function getCatStyle(cat: string, locale: string) {
  const koKey = locale === "en" ? (CAT_EN_TO_KO[cat] ?? cat) : cat;
  return CATEGORY_STYLES[koKey] ?? CATEGORY_STYLES["전체"];
}

export default function MessagePage() {
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [current, setCurrent] = useState<Message | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(locale === "en" ? "All" : "전체");
  const [loading, setLoading] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const { shareWithCapture } = useKakaoShare();

  const CATEGORIES = locale === "en" ? CATEGORIES_EN : CATEGORIES_KO;

  // DB 쿼리는 항상 KO 카테고리명으로
  const dbCategory = locale === "en"
    ? (CAT_EN_TO_KO[selectedCategory] ?? selectedCategory)
    : selectedCategory;

  const t = {
    header:      locale === "en" ? "Today's Message for You"      : "오늘 나를 위한 메시지",
    catLabel:    locale === "en" ? "Choose a category 😊"         : "카테고리를 선택하세요 😊",
    loading:     locale === "en" ? "Loading messages..."           : "메시지를 불러오는 중...",
    empty:       locale === "en" ? "No messages in this category." : "이 카테고리에 아직 문장이 없어요",
    emptySub:    locale === "en" ? "Try another category."         : "다른 카테고리를 선택해보세요",
    sunnyLabel:  locale === "en" ? "Sunny's Note"                  : "써니의 한마디",
    shuffle:     locale === "en" ? "Draw Another Message"          : "다른 메시지 뽑기",
    kakao:       locale === "en" ? "Share via KakaoTalk"           : "카카오로 공유하기",
    countAll:    locale === "en" ? "All" : "전체",
    countSuffix: locale === "en" ? "messages in this category"    : "개의 문장 중에서 뽑았어요",
  };

  useEffect(() => {
    setSeenIds([]);
    fetchMessages();
  }, [selectedCategory]);

  async function fetchMessages() {
    setLoading(true);
    let query = supabase.from("messages").select("*").eq("is_active", true);

    const isAll = selectedCategory === "전체" || selectedCategory === "All";
    if (!isAll) {
      query = query.eq("category", dbCategory);
    }

    const { data, error } = await query;
    if (error) {
      console.error("메시지 로드 실패:", error);
      setLoading(false);
      return;
    }

    setMessages(data || []);
    if (data && data.length > 0) {
      pickRandom(data, []);
    } else {
      setCurrent(null);
    }
    setLoading(false);
  }

  function pickRandom(pool: Message[], seen: number[], currentId?: number) {
    const unseen = pool.filter((m) => !seen.includes(m.id));
    const candidates = unseen.length > 0
      ? unseen
      : pool.filter((m) => m.id !== currentId);
    const finalPool = candidates.length > 0 ? candidates : pool;
    const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
    setCurrent(chosen);
    const newSeen = unseen.length > 0 ? [...seen, chosen.id] : [chosen.id];
    setSeenIds(newSeen);
  }

  function handleShuffle() {
    if (messages.length === 0) return;
    setIsShaking(true);
    setTimeout(() => {
      pickRandom(messages, seenIds, current?.id);
      setIsShaking(false);
    }, 400);
  }

  const handleBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };

  const handleShare = () => {
    if (!current) return;
    const quoteText = locale === "en" && current.quote_en ? current.quote_en : current.quote;
    shareWithCapture({
      captureId: "message-capture",
      title: locale === "en" ? "Today's Message for You" : "오늘 나를 위한 메시지",
      description: `"${quoteText}" — ${current.philosopher}`,
      buttonText: locale === "en" ? "Get my message →" : "나도 메시지 받기 →",
      pageUrl: "https://dasangdam.com/services/message",
    });
  };

  // 현재 카드에 표시할 텍스트
  const displayQuote   = locale === "en" && current?.quote_en   ? current.quote_en   : current?.quote;
  const displayComment = locale === "en" && current?.comment_en ? current.comment_en : current?.comment;
  const displayCat     = locale === "en"
    ? (CAT_KO_TO_EN[current?.category ?? "전체"] ?? current?.category)
    : current?.category;

  const catStyle = getCatStyle(current?.category ?? "전체", "ko"); // 스타일은 KO 기준

  const isAll = selectedCategory === "전체" || selectedCategory === "All";

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-zinc-900">
      <div className="mx-auto max-w-md pb-20">

        {/* 헤더 */}
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F5F0E8]/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4">
            <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-lg font-extrabold tracking-tight">{t.header}</div>
            <button onClick={handleShare} disabled={!current}
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 transition ${current ? "bg-[#FEE500] ring-[#F0D800] hover:scale-105" : "bg-zinc-100 ring-zinc-200 opacity-40 cursor-not-allowed"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
              </svg>
            </button>
          </div>
        </header>

        <div className="px-4 pt-6 space-y-5">

          <p className="text-sm text-zinc-400 font-medium">{t.catLabel}</p>

          {/* 카테고리 버튼 */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const koKey = locale === "en" ? (CAT_EN_TO_KO[cat] ?? cat) : cat;
              const s = CATEGORY_STYLES[koKey] ?? CATEGORY_STYLES["전체"];
              const isSelected = selectedCategory === cat;
              return (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-bold border transition ${isSelected ? `${s.bg} ${s.text} ${s.border}` : "bg-white text-zinc-500 border-zinc-200"}`}>
                  {cat} {s.emoji}
                </button>
              );
            })}
          </div>

          {/* 메시지 카드 */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-sm text-zinc-400 animate-pulse">{t.loading}</div>
            </div>
          ) : !current ? (
            <div className="flex h-64 items-center justify-center rounded-[32px] bg-white ring-1 ring-zinc-100">
              <div className="text-center text-sm text-zinc-400">
                <p>{t.empty}</p>
                <p className="mt-1">{t.emptySub}</p>
              </div>
            </div>
          ) : (
            <div
              id="message-capture"
              className={`rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 transition-all ${isShaking ? "scale-95 opacity-70" : "scale-100 opacity-100"}`}
              style={{ transition: "all 0.3s ease" }}
            >
              {/* 카테고리 뱃지 */}
              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold mb-5 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                {displayCat} {catStyle.emoji}
              </div>

              {/* 철학자 */}
              <div className="text-xs font-semibold text-zinc-400 mb-3">{current.philosopher}</div>

              {/* 명언 — EN 있으면 EN 표시 */}
              <blockquote className="text-xl font-bold leading-8 text-zinc-900 mb-5">
                "{displayQuote}"
              </blockquote>

              <div className="border-t border-zinc-100 my-4" />

              {/* 써니의 한마디 — EN 있으면 EN 표시 */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm">
                  ☀️
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-600 mb-1">{t.sunnyLabel}</div>
                  <div className="text-sm leading-6 text-zinc-600">{displayComment}</div>
                </div>
              </div>

              <div className="mt-5 text-right text-[11px] text-zinc-300">dasangdam.com</div>
            </div>
          )}

          {/* 버튼들 */}
          <button onClick={handleShuffle} disabled={loading || messages.length === 0}
            className="w-full rounded-[24px] bg-zinc-900 px-5 py-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition hover:translate-y-[-1px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <RefreshCw className={`h-4 w-4 ${isShaking ? "animate-spin" : ""}`} />
            {t.shuffle}
          </button>

          {current && (
            <button onClick={handleShare}
              className="w-full rounded-[24px] bg-[#FEE500] px-5 py-4 text-sm font-extrabold text-zinc-900 shadow-[0_8px_24px_rgba(254,229,0,0.4)] transition hover:translate-y-[-1px] flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
              </svg>
              {t.kakao}
            </button>
          )}

          {!loading && messages.length > 0 && (
            <p className="text-center text-xs text-zinc-400">
              {isAll ? t.countAll : selectedCategory} {messages.length} {t.countSuffix}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
