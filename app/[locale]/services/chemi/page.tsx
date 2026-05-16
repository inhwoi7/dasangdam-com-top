'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { castHexagram, generateReading, lineValueName } from './lib/iching-logic';
import type { Line, ReadingResult } from './lib/iching-logic';
import hexagramsData from './data/hexagrams.json';

// ── 용어 정리 ─────────────────────────────────────────────
// 본괘   → 현재 나의 운세
// 지괘   → 미래의 결과
// 괘사   → 종합 분석
// 효사   → 오늘의 행동 지침
// 상사   → 핵심 요약
// 단사   → 상세 조언
// 상괘   → 주변 상황
// 하괘   → 나의 태도
// 변효   → 바뀌는 효 (그대로 유지, 직관적)
// 다시 점치기 · 再占 → 다시 점치기
// ──────────────────────────────────────────────────────────

const KAKAO_JS_KEY = '60eb58888334fc1d1771a472c2730fb0';

function useKakaoShare() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('kakao-sdk')) return;
    const script = document.createElement('script');
    script.id = 'kakao-sdk';
    script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
    script.async = true;
    script.onload = () => {
      const kakao = (window as any).Kakao;
      if (kakao && !kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);
    };
    document.head.appendChild(script);
  }, []);

  const shareWithCapture = useCallback(async ({
    title, description, buttonText = '나도 확인하기 →', pageUrl,
  }: {
    captureId: string; title: string; description: string;
    buttonText?: string; pageUrl: string; imageUrl?: string;
  }) => {
    try {
      const kakao = (window as any).Kakao;
      if (!kakao) throw new Error('카카오 SDK 미로드');
      if (!kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);
      const thumbnail =
        (typeof window !== 'undefined'
          ? (document.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content
          : undefined) || 'https://dasangdam.com/og-image.png';
      kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title, description, imageUrl: thumbnail,
          link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
        },
        buttons: [{ title: buttonText, link: { mobileWebUrl: pageUrl, webUrl: pageUrl } }],
      });
    } catch (err) {
      console.error('카카오 공유 실패:', err);
      alert('공유에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  }, []);

  return { shareWithCapture };
}

interface HexagramData {
  number: number;
  chineseName: string;
  koreanName: string;
  meaning: string;
  upperTrigram: string;
  lowerTrigram: string;
  image: string;
  judgment: string;
  changingLines: Record<string, string>;
}

type AppState = 'idle' | 'casting' | 'revealed';

function HexagramLine({ line, index, animate }: { line: Line; index: number; animate: boolean }) {
  const isChanging = line.isChanging;
  return (
    <motion.div
      className="flex items-center justify-center gap-2 my-1"
      initial={animate ? { opacity: 0, y: 20, scale: 0.8 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-4 flex justify-center flex-shrink-0">
        {isChanging && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.18 + 0.4 }} className="w-3 h-3 rounded-full bg-amber-600" />
        )}
      </div>
      <div className="flex items-center gap-1.5 w-32 sm:w-44">
        {line.isYang ? (
          <motion.div className={`h-3 w-full rounded ${isChanging ? 'bg-amber-600' : 'bg-stone-800'}`} initial={animate ? { scaleX: 0 } : false} animate={{ scaleX: 1 }} transition={{ delay: index * 0.18 + 0.1, duration: 0.4, ease: 'easeOut' }} style={{ transformOrigin: 'center' }} />
        ) : (
          <>
            <motion.div className={`h-3 w-[46%] rounded ${isChanging ? 'bg-amber-600' : 'bg-stone-800'}`} initial={animate ? { scaleX: 0 } : false} animate={{ scaleX: 1 }} transition={{ delay: index * 0.18 + 0.1, duration: 0.4, ease: 'easeOut' }} style={{ transformOrigin: 'right' }} />
            <motion.div className={`h-3 w-[46%] rounded ${isChanging ? 'bg-amber-600' : 'bg-stone-800'}`} initial={animate ? { scaleX: 0 } : false} animate={{ scaleX: 1 }} transition={{ delay: index * 0.18 + 0.15, duration: 0.4, ease: 'easeOut' }} style={{ transformOrigin: 'left' }} />
          </>
        )}
      </div>
      <div className="w-5 text-xs text-stone-600 font-bold flex-shrink-0">{line.value}</div>
    </motion.div>
  );
}

function HexagramDisplay({ lines, animate = true }: { lines: Line[]; animate?: boolean }) {
  const reversed = [...lines].reverse();
  return (
    <div className="flex flex-col items-center">
      {reversed.map((line, displayIdx) => {
        const actualIdx = 5 - displayIdx;
        return <HexagramLine key={actualIdx} line={line} index={animate ? displayIdx : 0} animate={animate} />;
      })}
    </div>
  );
}

function CastingAnimation() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <motion.div className="text-stone-800 text-base tracking-[0.3em]" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
        천지를 감응하는 중...
      </motion.div>
      <div className="flex gap-4">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="w-12 h-12 rounded-full border-2 border-stone-700 bg-stone-100 flex items-center justify-center text-stone-800 font-bold text-base" animate={{ rotateY: [0, 180, 360], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2, ease: 'easeInOut' }}>
            周
          </motion.div>
        ))}
      </div>
      <motion.div className="text-sm text-stone-700 tracking-widest" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.4, delay: 0.6 }}>
        6개의 효를 뽑는 중...
      </motion.div>
    </div>
  );
}

// ── 탭 설명 툴팁 ─────────────────────────────────────────
function TabTooltip({ text }: { text: string }) {
  return (
    <span className="ml-1 text-[10px] font-normal text-stone-400 hidden sm:inline">· {text}</span>
  );
}

function ResultCard({ reading, onReset, question, onShare }: {
  reading: ReadingResult; onReset: () => void; question: string; onShare: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'original' | 'changed' | 'lines'>('original');
  const hexData = (num: number): HexagramData | undefined =>
    hexagramsData.hexagrams.find((h) => h.number === num) as HexagramData | undefined;
  const orig = hexData(reading.original.hexagramNumber);
  const chan = reading.changed ? hexData(reading.changed.hexagramNumber) : null;
  if (!orig) return null;

  // ── 탭 구성 (쉬운 용어로) ──
  const tabs = [
    { key: 'original' as const, label: '종합 분석', sub: '이 괘의 전체 흐름' },
    ...(reading.hasChangingLines && chan
      ? [{ key: 'changed' as const, label: `미래의 결과`, sub: `${chan.chineseName} · ${chan.koreanName}` }]
      : []),
    { key: 'lines' as const, label: '오늘의 행동 지침', sub: '각 효의 구체적 메시지' },
  ];

  return (
    <motion.div className="w-full" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

      {/* ── 본괘/지괘 표시 영역 ── */}
      <div className={`flex ${reading.hasChangingLines && chan ? 'flex-col sm:flex-row' : 'flex-col'} items-center justify-center gap-6 mb-8`}>
        {/* 본괘 → "현재 나의 운세" */}
        <div className="text-center">
          <div className="text-sm text-stone-700 tracking-widest mb-1 font-bold">현재 나의 운세</div>
          <div className="text-xs text-stone-400 mb-3 tracking-wide">지금 뽑힌 괘</div>
          <HexagramDisplay lines={reading.original.lines} animate={false} />
          <div className="mt-3 text-3xl font-bold text-stone-900">{orig.chineseName}</div>
          <div className="text-base text-stone-800 font-medium mt-1">{orig.koreanName} · {orig.meaning}</div>
          <div className="text-xs text-stone-500 mt-1">제{orig.number}괘</div>
        </div>

        {/* 지괘 → "미래의 결과" */}
        {reading.hasChangingLines && chan && (
          <>
            <div className="flex sm:flex-col items-center justify-center gap-1">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-stone-700 text-2xl font-bold">
                <span className="hidden sm:block">↓</span><span className="block sm:hidden">→</span>
              </motion.div>
              <div className="text-xs text-amber-700 tracking-widest font-medium">바뀌는 효</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-amber-700 tracking-widest mb-1 font-bold">미래의 결과</div>
              <div className="text-xs text-amber-500 mb-3 tracking-wide">내 행동에 따라 변할 미래</div>
              <HexagramDisplay lines={reading.changed!.lines} animate={false} />
              <div className="mt-3 text-3xl font-bold text-amber-900">{chan.chineseName}</div>
              <div className="text-base text-amber-800 font-medium mt-1">{chan.koreanName} · {chan.meaning}</div>
              <div className="text-xs text-amber-600 mt-1">제{chan.number}괘</div>
            </div>
          </>
        )}
      </div>

      {/* ── 탭 네비게이션 ── */}
      <div className="flex border-b-2 border-stone-300 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-3 text-sm sm:text-base tracking-wide transition-all duration-200 border-b-2 font-medium ${
              activeTab === tab.key
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.label}
            <TabTooltip text={tab.sub} />
          </button>
        ))}
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>

          {/* 종합 분석 탭 (= 괘사) */}
          {activeTab === 'original' && (
            <div className="space-y-4">
              {/* 핵심 요약 (= 상사) */}
              <div className="bg-stone-100 rounded-xl p-4 border border-stone-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-stone-800">💡 핵심 요약</span>
                  <span className="text-[10px] text-stone-400 font-normal">象辭 상사</span>
                </div>
                <p className="text-stone-800 text-base leading-relaxed italic">{orig.image}</p>
              </div>
              {/* 상세 조언 (= 단사) */}
              <div className="bg-white rounded-xl p-4 border border-stone-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-stone-800">📖 상세 조언</span>
                  <span className="text-[10px] text-stone-400 font-normal">彖辭 단사</span>
                </div>
                <p className="text-stone-900 text-base leading-relaxed">{orig.judgment}</p>
              </div>
              {/* 주변 상황 / 나의 태도 (= 상괘/하괘) */}
              <div className="grid grid-cols-2 gap-3 text-sm text-center">
                <div className="bg-stone-100 rounded-lg p-3 border border-stone-300">
                  <div className="text-[10px] text-stone-400 font-medium mb-0.5">上卦 · 주변 상황</div>
                  <div className="font-bold text-stone-900">{orig.upperTrigram}</div>
                </div>
                <div className="bg-stone-100 rounded-lg p-3 border border-stone-300">
                  <div className="text-[10px] text-stone-400 font-medium mb-0.5">下卦 · 나의 태도</div>
                  <div className="font-bold text-stone-900">{orig.lowerTrigram}</div>
                </div>
              </div>
            </div>
          )}

          {/* 미래의 결과 탭 (= 지괘) */}
          {activeTab === 'changed' && chan && (
            <div className="space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-1">
                <p className="text-amber-800 text-sm leading-relaxed">
                  ✨ <strong>바뀌는 효</strong>가 있어요. 지금의 선택과 행동에 따라 <strong>{chan.koreanName}({chan.chineseName})</strong>의 흐름으로 나아갈 수 있습니다.
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-amber-800">💡 핵심 요약</span>
                  <span className="text-[10px] text-amber-500 font-normal">象辭 상사</span>
                </div>
                <p className="text-amber-900 text-base leading-relaxed italic">{chan.image}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-amber-800">📖 상세 조언</span>
                  <span className="text-[10px] text-amber-500 font-normal">彖辭 단사</span>
                </div>
                <p className="text-amber-900 text-base leading-relaxed">{chan.judgment}</p>
              </div>
            </div>
          )}

          {/* 오늘의 행동 지침 탭 (= 효사) */}
          {activeTab === 'lines' && (
            <div className="space-y-3">
              {/* 설명 */}
              <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3">
                <p className="text-xs text-stone-500 leading-relaxed">
                  각 줄(효)마다 구체적인 메시지가 담겨 있어요.
                  <span className="text-amber-700 font-bold"> 주황색</span>으로 표시된 항목이 지금 당신에게 특히 해당하는 메시지예요.
                </p>
              </div>
              {reading.original.lines.map((line, idx) => {
                const lineNum = idx + 1;
                const lineText = orig.changingLines[String(lineNum)];
                const isChanging = line.isChanging;
                // 효 위치 이름 (아래부터: 초효, 2효 ... 상효)
                const linePositionLabel =
                  lineNum === 1 ? '첫 번째 (초효)' :
                  lineNum === 2 ? '두 번째' :
                  lineNum === 3 ? '세 번째' :
                  lineNum === 4 ? '네 번째' :
                  lineNum === 5 ? '다섯 번째' : '맨 위 (상효)';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className={`rounded-xl p-4 border ${isChanging ? 'bg-amber-50 border-amber-400' : 'bg-stone-100 border-stone-200'}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-sm font-bold ${isChanging ? 'text-amber-800' : 'text-stone-600'}`}>
                        {linePositionLabel} 줄
                      </span>
                      <span className="text-[10px] text-stone-400">{lineNum}爻 · {line.isYang ? '양(陽)' : '음(陰)'}</span>
                      {isChanging && (
                        <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          ✨ 지금 당신의 메시지 ({lineValueName(line.value)})
                        </span>
                      )}
                    </div>
                    <p className={`leading-relaxed text-base ${isChanging ? 'text-amber-900 font-semibold' : 'text-stone-700'}`}>
                      {lineText}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── 카카오 공유 버튼 ── */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#FEE500] text-zinc-900 rounded-full font-bold text-sm tracking-wide shadow-md active:scale-95 transition-all w-full max-w-xs"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
          </svg>
          카카오톡으로 공유하기
        </button>
        <p className="text-xs text-stone-500">
          다상담{' '}
          <a href="https://dasangdam.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">dasangdam.com</a>
        </p>
      </div>

      {/* ── 다시 점치기 버튼 (한자 제거) ── */}
      <motion.div className="mt-4 flex justify-center" whileTap={{ scale: 0.97 }}>
        <button
          onClick={onReset}
          className="px-8 py-3 border-2 border-stone-400 rounded-full text-stone-600 text-base font-medium tracking-wider hover:border-stone-800 hover:text-stone-900 transition-all duration-300"
        >
          다시 점치기
        </button>
      </motion.div>
    </motion.div>
  );
}

function HistoryItem({ reading, onClick }: { reading: ReadingResult & { timestamp: Date }; onClick: () => void }) {
  const hexData = (num: number) => hexagramsData.hexagrams.find((h) => h.number === num);
  const orig = hexData(reading.original.hexagramNumber);
  const chan = reading.changed ? hexData(reading.changed.hexagramNumber) : null;
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 rounded-xl border border-stone-300 hover:border-stone-500 hover:bg-stone-100 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl text-stone-900 font-bold">{orig?.chineseName}</span>
          {chan && <><span className="text-stone-600 font-bold">→</span><span className="text-xl text-amber-800 font-bold">{chan.chineseName}</span></>}
        </div>
        <span className="text-sm text-stone-600">{reading.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="text-sm text-stone-700 mt-1 font-medium">{orig?.koreanName} · {orig?.meaning}</div>
    </button>
  );
}

export default function IChingPage() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [currentReading, setCurrentReading] = useState<ReadingResult | null>(null);
  const [history, setHistory] = useState<(ReadingResult & { timestamp: Date })[]>([]);
  const [question, setQuestion] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<(ReadingResult & { timestamp: Date }) | null>(null);
  const castTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { shareWithCapture } = useKakaoShare();

  const handleCast = useCallback(() => {
    if (appState === 'casting') return;
    setAppState('casting');
    setCurrentReading(null);
    castTimeoutRef.current = setTimeout(() => {
      const lines = castHexagram();
      const reading = generateReading(lines);
      const timestampedReading = { ...reading, timestamp: new Date() };
      setCurrentReading(reading);
      setHistory((prev) => [timestampedReading, ...prev.slice(0, 9)]);
      setAppState('revealed');
    }, 2200);
  }, [appState]);

  const handleReset = useCallback(() => {
    setAppState('idle');
    setCurrentReading(null);
    setQuestion('');
    setSelectedHistory(null);
  }, []);

  const handleShare = useCallback(() => {
    const reading = selectedHistory ?? currentReading;
    if (!reading) return;
    const hexData = (num: number) => hexagramsData.hexagrams.find((h) => h.number === num);
    const orig = hexData(reading.original.hexagramNumber);
    const chan = reading.changed ? hexData(reading.changed.hexagramNumber) : null;
    if (!orig) return;

    const title = chan
      ? `주역점 ${orig.chineseName}(${orig.koreanName}) → ${chan.chineseName}(${chan.koreanName})`
      : `주역점 제${orig.number}괘 ${orig.chineseName} · ${orig.koreanName}`;
    const description = question ? `"${question}" · ${orig.meaning}` : orig.meaning;

    shareWithCapture({
      captureId: 'iching-capture',
      title,
      description,
      buttonText: '나도 점치기 →',
      pageUrl: 'https://dasangdam.com/services/iching',
    });
  }, [selectedHistory, currentReading, question, shareWithCapture]);

  const displayReading = selectedHistory ?? currentReading;
  const displayQuestion = selectedHistory ? '' : question;

  return (
    <div className="min-h-screen bg-[#EDEAE2] text-stone-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-4 text-[80px] sm:text-[120px] text-stone-300 leading-none select-none">易</div>
        <div className="absolute bottom-4 left-4 text-[60px] sm:text-[80px] text-stone-300 leading-none select-none">道</div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-stone-300">
        <button onClick={handleReset} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <div className="w-9 h-9 border-2 border-stone-700 rounded-sm flex items-center justify-center text-base text-stone-800 font-bold">易</div>
          <div>
            <div className="text-base font-bold tracking-wider text-stone-900">주역점</div>
            <div className="text-xs text-stone-500 tracking-widest font-medium">I CHING ORACLE</div>
          </div>
        </button>
        {history.length > 0 && (
          <button
            onClick={() => { setShowHistory(!showHistory); setSelectedHistory(null); }}
            className={`text-xs sm:text-sm font-medium tracking-widest px-3 py-2 rounded-full border-2 transition-all duration-200 ${showHistory ? 'bg-stone-800 text-stone-100 border-stone-800' : 'border-stone-600 text-stone-700 hover:border-stone-900'}`}
          >
            기록 ({history.length})
          </button>
        )}
      </header>

      <div className="relative z-10 flex flex-col lg:flex-row max-w-3xl mx-auto px-4 py-6 gap-8">
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.aside className="lg:w-64 flex-shrink-0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="sticky top-8">
                <div className="text-sm text-stone-700 font-bold tracking-widest mb-3">오늘의 점 기록</div>
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <HistoryItem key={i} reading={h} onClick={() => { setSelectedHistory(h); setShowHistory(false); setAppState('revealed'); }} />
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {appState === 'idle' && (
              <motion.div key="idle" className="w-full flex flex-col items-center gap-7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
                <div className="text-center space-y-3 pt-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl sm:text-7xl font-bold text-stone-900 tracking-wider">周易</motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-stone-700 tracking-[0.4em] uppercase font-medium">Book of Changes</motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-base text-stone-800 leading-relaxed max-w-xs mx-auto">
                    마음을 고요히 하고 묻고자 하는 것을 떠올리세요.<br />
                    <span className="text-stone-600">천지는 성심으로 구하는 자에게 응합니다.</span>
                  </motion.p>
                </div>

                <motion.div className="w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="궁금한 것을 적어보세요 (선택사항)"
                    className="w-full px-4 py-3 bg-white border-2 border-stone-400 rounded-xl text-base text-stone-900 placeholder-stone-400 resize-none focus:outline-none focus:border-stone-700 transition-colors"
                    rows={2}
                  />
                </motion.div>

                <motion.div
                  className="w-full"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '2px', fontSize: '12px', textAlign: 'center' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {hexagramsData.hexagrams.slice(0, 64).map((h) => (
                    <div
                      key={h.number}
                      title={`${h.number}. ${h.chineseName}(${h.koreanName}) - ${h.meaning}`}
                      className="aspect-square flex items-center justify-center text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-300 rounded transition-colors cursor-default font-medium"
                    >
                      {h.chineseName}
                    </div>
                  ))}
                </motion.div>

                <motion.button
                  onClick={handleCast}
                  className="px-12 py-4 bg-stone-900 text-stone-100 rounded-full text-base font-medium tracking-[0.3em] hover:bg-stone-800 active:scale-95 transition-all duration-300 shadow-lg"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  占 · 점을 치다
                </motion.button>

                <motion.div className="text-center text-sm text-stone-600 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  동전 세 개를 여섯 번 던져 괘를 뽑습니다
                </motion.div>
              </motion.div>
            )}

            {appState === 'casting' && (
              <motion.div key="casting" className="w-full flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {question && (
                  <motion.div className="mb-6 px-5 py-3 bg-white rounded-xl border-2 border-stone-400 text-base text-stone-800 italic max-w-xs text-center font-medium" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    &ldquo;{question}&rdquo;
                  </motion.div>
                )}
                <CastingAnimation />
              </motion.div>
            )}

            {appState === 'revealed' && displayReading && (
              <motion.div key="revealed" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {displayQuestion && (
                  <motion.div className="mb-4 px-5 py-3 bg-white rounded-xl border-2 border-stone-400 text-base text-stone-800 italic text-center font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    &ldquo;{displayQuestion}&rdquo;
                  </motion.div>
                )}
                {/* 효 그림 카드 */}
                <motion.div className="bg-white rounded-2xl p-5 border-2 border-stone-300 shadow-sm mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <HexagramDisplay lines={displayReading.original.lines} animate={!selectedHistory} />
                  {displayReading.hasChangingLines && (
                    <motion.div className="mt-4 pt-4 border-t-2 border-stone-200 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                      <span className="text-sm text-amber-800 tracking-widest font-bold">
                        ● 주황 = 바뀌는 효 · {displayReading.changingLineIndices.length}개
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                {/* 결과 카드 */}
                <motion.div className="bg-white rounded-2xl p-5 border-2 border-stone-300 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <ResultCard
                    reading={displayReading}
                    onReset={handleReset}
                    question={displayQuestion}
                    onShare={handleShare}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="relative z-10 text-center py-6 text-sm text-stone-600 tracking-widest font-medium">
        <div>주역 · Book of Changes · 64괘 완전판</div>
        <div className="mt-1">동전 던지기(擲錢法) 알고리즘 기반 · King Wen 순서</div>
      </footer>
    </div>
  );
}
