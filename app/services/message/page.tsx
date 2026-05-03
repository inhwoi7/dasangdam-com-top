"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useKakaoShare } from "@/lib/useKakaoShare";
import { ArrowLeft, RefreshCw } from "lucide-react";

type Message = {
  id: number;
  category: string;
  philosopher: string;
  quote: string;
  comment: string;
  is_active: boolean;
};

const CATEGORIES = ["전체", "자존감", "관계", "커리어", "휴식"];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  전체: { bg: "bg-zinc-100", text: "text-zinc-700", border: "border-zinc-200", emoji: "✨" },
  자존감: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", emoji: "💜" },
  관계: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", emoji: "🌹" },
  커리어: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", emoji: "🔵" },
  휴식: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", emoji: "🌿" },
};

export default function MessagePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [current, setCurrent] = useState<Message | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const { shareWithCapture } = useKakaoShare();

  useEffect(() => {
    setSeenIds([]); // 카테고리 바뀌면 히스토리 초기화
    fetchMessages();
  }, [selectedCategory]);

  async function fetchMessages() {
    setLoading(true);
    let query = supabase
      .from("messages")
      .select("*")
      .eq("is_active", true);

    if (selectedCategory !== "전체") {
      query = query.eq("category", selectedCategory);
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
    // 아직 안 본 메시지 우선으로 선택
    const unseen = pool.filter((m) => !seen.includes(m.id));
    // 다 봤으면 현재 메시지만 제외하고 전체에서 선택 (히스토리 리셋)
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
    shareWithCapture({
      captureId: "message-capture",
      title: `오늘 나를 위한 메시지`,
      description: `"${current.quote}" — ${current.philosopher}`,
      buttonText: "나도 메시지 받기 →",
      pageUrl: "https://dasangdam.com/services/message",
    });
  };

  const catStyle = CATEGORY_STYLES[current?.category ?? "전체"] ?? CATEGORY_STYLES["전체"];

  return (
    <main className="min-h-screen bg-[#F5F0E8] text-zinc-900">
      <div className="mx-auto max-w-md pb-20">

        {/* 헤더 */}
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F5F0E8]/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4">
            <button onClick={handleBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-lg font-extrabold tracking-tight">오늘 나를 위한 메시지</div>
            <button onClick={handleShare} disabled={!current}
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 transition ${current ? "bg-[#FEE500] ring-[#F0D800] hover:scale-105" : "bg-zinc-100 ring-zinc-200 opacity-40 cursor-not-allowed"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
              </svg>
            </button>
          </div>
        </header>

        <div className="px-4 pt-6 space-y-5">

          {/* 카테고리 안내 레이블 */}
          <p className="text-sm text-zinc-400 font-medium">카테고리를 선택하세요 😊</p>

          {/* 카테고리 선택 */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const s = CATEGORY_STYLES[cat];
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
              <div className="text-sm text-zinc-400 animate-pulse">메시지를 불러오는 중...</div>
            </div>
          ) : !current ? (
            <div className="flex h-64 items-center justify-center rounded-[32px] bg-white ring-1 ring-zinc-100">
              <div className="text-center text-sm text-zinc-400">
                <p>이 카테고리에 아직 문장이 없어요</p>
                <p className="mt-1">다른 카테고리를 선택해보세요</p>
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
                {current.category} {catStyle.emoji}
              </div>

              {/* 철학자 */}
              <div className="text-xs font-semibold text-zinc-400 mb-3">{current.philosopher}</div>

              {/* 명언 */}
              <blockquote className="text-xl font-bold leading-8 text-zinc-900 mb-5">
                "{current.quote}"
              </blockquote>

              {/* 구분선 */}
              <div className="border-t border-zinc-100 my-4" />

              {/* 써니의 한마디 */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm">
                  ☀️
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-600 mb-1">써니의 한마디</div>
                  <div className="text-sm leading-6 text-zinc-600">{current.comment}</div>
                </div>
              </div>

              {/* 워터마크 */}
              <div className="mt-5 text-right text-[11px] text-zinc-300">dasangdam.com</div>
            </div>
          )}

          {/* 다시 뽑기 버튼 */}
          <button onClick={handleShuffle} disabled={loading || messages.length === 0}
            className="w-full rounded-[24px] bg-zinc-900 px-5 py-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition hover:translate-y-[-1px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <RefreshCw className={`h-4 w-4 ${isShaking ? "animate-spin" : ""}`} />
            다른 메시지 뽑기
          </button>

          {/* 카카오 공유 */}
          {current && (
            <button onClick={handleShare}
              className="w-full rounded-[24px] bg-[#FEE500] px-5 py-4 text-sm font-extrabold text-zinc-900 shadow-[0_8px_24px_rgba(254,229,0,0.4)] transition hover:translate-y-[-1px] flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
              </svg>
              카카오로 공유하기
            </button>
          )}

          {/* 문장 개수 안내 */}
          {!loading && messages.length > 0 && (
            <p className="text-center text-xs text-zinc-400">
              {selectedCategory === "전체" ? "전체" : selectedCategory} {messages.length}개의 문장 중에서 뽑았어요
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
