'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { castHexagram, generateReading, lineValueName } from './lib/iching-logic';
import type { Line, ReadingResult } from './lib/iching-logic';
import hexagramsData from './data/hexagrams.json';

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
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.18 + 0.4 }}
            className="w-3 h-3 rounded-full bg-amber-600"
          />
        )}
      </div>
      <div className="flex items-center gap-1.5 w-32 sm:w-44">
        {line.isYang ? (
          <motion.div
            className={`h-3 w-full rounded ${isChanging ? 'bg-amber-600' : 'bg-stone-800'}`}
            initial={animate ? { scaleX: 0 } : false}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.18 + 0.1, duration: 0.4, ease: 'easeOut' }}
            style={{ transformOrigin: 'center' }}
          />
        ) : (
          <>
            <motion.div
              className={`h-3 w-[46%] rounded ${isChanging ? 'bg-amber-600' : 'bg-stone-800'}`}
              initial={animate ? { scaleX: 0 } : false}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.18 + 0.1, duration: 0.4, ease: 'easeOut' }}
              style={{ transformOrigin: 'right' }}
            />
            <motion.div
              className={`h-3 w-[46%] rounded ${isChanging ? 'bg-amber-600' : 'bg-stone-800'}`}
              initial={animate ? { scaleX: 0 } : false}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.18 + 0.15, duration: 0.4, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />
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
        6효를 형성하고 있습니다
      </motion.div>
    </div>
  );
}

function ResultCard({ reading, onReset }: { reading: ReadingResult; onReset: () => void }) {
  const [activeTab, setActiveTab] = useState<'original' | 'changed' | 'lines'>('original');
  const hexData = (num: number): HexagramData | undefined => hexagramsData.hexagrams.find((h) => h.number === num) as HexagramData | undefined;
  const orig = hexData(reading.original.hexagramNumber);
  const chan = reading.changed ? hexData(reading.changed.hexagramNumber) : null;
  if (!orig) return null;

  const tabs = [
    { key: 'original' as const, label: '괘사' },
    ...(reading.hasChangingLines && chan ? [{ key: 'changed' as const, label: `지괘 ${chan.chineseName}` }] : []),
    { key: 'lines' as const, label: '효사' },
  ];

  return (
    <motion.div className="w-full" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

      {/* 본괘 / 지괘 */}
      <div className={`flex ${reading.hasChangingLines && chan ? 'flex-col sm:flex-row' : 'flex-col'} items-center justify-center gap-6 mb-8`}>
        <div className="text-center">
          <div className="text-sm text-stone-700 tracking-widest mb-2 font-medium">本卦 본괘</div>
          <HexagramDisplay lines={reading.original.lines} animate={false} />
          <div className="mt-3 text-3xl font-bold text-stone-900">{orig.chineseName}</div>
          <div className="text-base text-stone-800 font-medium mt-1">{orig.koreanName} · {orig.meaning}</div>
          <div className="text-sm text-stone-600 mt-1">第{orig.number}卦</div>
        </div>

        {reading.hasChangingLines && chan && (
          <>
            <div className="flex sm:flex-col items-center justify-center gap-1">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-stone-700 text-2xl font-bold">
                <span className="hidden sm:block">↓</span>
                <span className="block sm:hidden">→</span>
              </motion.div>
              <div className="text-xs text-amber-700 tracking-widest font-medium">변효</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-amber-700 tracking-widest mb-2 font-medium">之卦 지괘</div>
              <HexagramDisplay lines={reading.changed!.lines} animate={false} />
              <div className="mt-3 text-3xl font-bold text-amber-900">{chan.chineseName}</div>
              <div className="text-base text-amber-800 font-medium mt-1">{chan.koreanName} · {chan.meaning}</div>
              <div className="text-sm text-amber-700 mt-1">第{chan.number}卦</div>
            </div>
          </>
        )}
      </div>

      {/* 탭 */}
      <div className="flex border-b-2 border-stone-300 mb-6">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-3 text-sm sm:text-base tracking-wide transition-all duration-200 border-b-2 font-medium ${activeTab === tab.key ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-600 hover:text-stone-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
          {activeTab === 'original' && (
            <div className="space-y-4">
              <div className="bg-stone-100 rounded-xl p-4 border border-stone-300">
                <div className="text-sm text-stone-700 mb-2 tracking-widest font-bold">象辭 상사</div>
                <p className="text-stone-800 text-base leading-relaxed italic">{orig.image}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-stone-400">
                <div className="text-sm text-stone-700 mb-2 tracking-widest font-bold">彖辭 단사</div>
                <p className="text-stone-900 text-base leading-relaxed">{orig.judgment}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-center">
                <div className="bg-stone-100 rounded-lg p-3 border border-stone-300">
                  <div className="text-stone-700 mb-1 font-medium">上卦</div>
                  <div className="font-bold text-stone-900">{orig.upperTrigram}</div>
                </div>
                <div className="bg-stone-100 rounded-lg p-3 border border-stone-300">
                  <div className="text-stone-700 mb-1 font-medium">下卦</div>
                  <div className="font-bold text-stone-900">{orig.lowerTrigram}</div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'changed' && chan && (
            <div className="space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-300">
                <div className="text-sm text-amber-800 mb-2 tracking-widest font-bold">象辭 상사</div>
                <p className="text-amber-900 text-base leading-relaxed italic">{chan.image}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-400">
                <div className="text-sm text-amber-800 mb-2 tracking-widest font-bold">彖辭 단사</div>
                <p className="text-amber-900 text-base leading-relaxed">{chan.judgment}</p>
              </div>
            </div>
          )}
          {activeTab === 'lines' && (
            <div className="space-y-3">
              {reading.original.lines.map((line, idx) => {
                const lineNum = idx + 1;
                const lineText = orig.changingLines[String(lineNum)];
                const isChanging = line.isChanging;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }} className={`rounded-xl p-4 border ${isChanging ? 'bg-amber-50 border-amber-400' : 'bg-stone-100 border-stone-300'}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-sm font-bold tracking-widest ${isChanging ? 'text-amber-800' : 'text-stone-700'}`}>{lineNum}爻</span>
                      {isChanging && <span className="text-xs bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full font-bold">변효 {lineValueName(line.value)}</span>}
                      <span className="text-xs text-stone-600 font-medium">{line.isYang ? '— 양(陽)' : '-- 음(陰)'}</span>
                    </div>
                    <p className={`leading-relaxed text-base ${isChanging ? 'text-amber-900 font-semibold' : 'text-stone-800'}`}>{lineText}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div className="mt-8 flex justify-center" whileTap={{ scale: 0.97 }}>
        <button onClick={onReset} className="px-8 py-3 border-2 border-stone-500 rounded-full text-stone-700 text-base font-medium tracking-widest hover:border-stone-800 hover:text-stone-900 transition-all duration-300">
          다시 점치기 · 再占
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

  const displayReading = selectedHistory ?? currentReading;

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
            <div className="text-base font-bold tracking-wider text-stone-900">周易占</div>
            <div className="text-xs text-stone-600 tracking-widest font-medium">I CHING ORACLE</div>
          </div>
        </button>
        {history.length > 0 && (
          <button onClick={() => { setShowHistory(!showHistory); setSelectedHistory(null); }} className={`text-xs sm:text-sm font-medium tracking-widest px-3 py-2 rounded-full border-2 transition-all duration-200 ${showHistory ? 'bg-stone-800 text-stone-100 border-stone-800' : 'border-stone-600 text-stone-700 hover:border-stone-900'}`}>
            기록 ({history.length})
          </button>
        )}
      </header>

      <div className="relative z-10 flex flex-col lg:flex-row max-w-3xl mx-auto px-4 py-6 gap-8">
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.aside className="lg:w-64 flex-shrink-0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="sticky top-8">
                <div className="text-sm text-stone-700 font-bold tracking-widest mb-3">오늘의 점사 기록</div>
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
                    <span className="text-stone-700">천지는 성심으로 구하는 자에게 응합니다.</span>
                  </motion.p>
                </div>

                <motion.div className="w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="점을 치고자 하는 질문을 적어보세요 (선택사항)" className="w-full px-4 py-3 bg-white border-2 border-stone-400 rounded-xl text-base text-stone-900 placeholder-stone-500 resize-none focus:outline-none focus:border-stone-700 transition-colors" rows={2} />
                </motion.div>

                <motion.div className="w-full" style={{display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:'2px', fontSize:'12px', textAlign:'center'}} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  {hexagramsData.hexagrams.slice(0, 64).map((h) => (
                    <div key={h.number} title={`${h.number}. ${h.chineseName}(${h.koreanName}) - ${h.meaning}`} className="aspect-square flex items-center justify-center text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-300 rounded transition-colors cursor-default font-medium">
                      {h.chineseName}
                    </div>
                  ))}
                </motion.div>

                <motion.button onClick={handleCast} className="px-12 py-4 bg-stone-900 text-stone-100 rounded-full text-base font-medium tracking-[0.3em] hover:bg-stone-800 active:scale-95 transition-all duration-300 shadow-lg" whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  占 · 점을 치다
                </motion.button>

                <motion.div className="text-center text-sm text-stone-700 font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  擲錢法 척전법 · 동전 세 개를 여섯 번 던집니다
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
                {question && (
                  <motion.div className="mb-4 px-5 py-3 bg-white rounded-xl border-2 border-stone-400 text-base text-stone-800 italic text-center font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    &ldquo;{question}&rdquo;
                  </motion.div>
                )}
                <motion.div className="bg-white rounded-2xl p-5 border-2 border-stone-300 shadow-sm mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <HexagramDisplay lines={displayReading.original.lines} animate={!selectedHistory} />
                  {displayReading.hasChangingLines && (
                    <motion.div className="mt-4 pt-4 border-t-2 border-stone-200 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                      <span className="text-sm text-amber-800 tracking-widest font-bold">● 주황 = 변효 · {displayReading.changingLineIndices.length}개 변효</span>
                    </motion.div>
                  )}
                </motion.div>
                <motion.div className="bg-white rounded-2xl p-5 border-2 border-stone-300 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <ResultCard reading={displayReading} onReset={handleReset} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="relative z-10 text-center py-6 text-sm text-stone-700 tracking-widest font-medium">
        <div>周易 · Book of Changes · 64괘 완전판</div>
        <div className="mt-1">擲錢法 알고리즘 기반 · King Wen 순서</div>
      </footer>
    </div>
  );
}
