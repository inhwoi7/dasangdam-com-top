'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useKakaoShare } from '@/lib/useKakaoShare'

const ALL_ANIMALS = [
  { id: 'lion',   emoji: '🦁', name: '사자',   nameEn: 'Lion' },
  { id: 'tiger',  emoji: '🐯', name: '호랑이', nameEn: 'Tiger' },
  { id: 'panda',  emoji: '🐼', name: '판다',   nameEn: 'Panda' },
  { id: 'pig',    emoji: '🐷', name: '돼지',   nameEn: 'Pig' },
  { id: 'fox',    emoji: '🦊', name: '여우',   nameEn: 'Fox' },
  { id: 'rabbit', emoji: '🐰', name: '토끼',   nameEn: 'Rabbit' },
  { id: 'bear',   emoji: '🐻', name: '곰',     nameEn: 'Bear' },
  { id: 'sheep',  emoji: '🐑', name: '양',     nameEn: 'Sheep' },
]

// 인원수에 따라 결과 슬롯 생성: 당첨 1개 + 순위 나머지
function buildResultSlots(count: number, isEn: boolean): string[] {
  const rankLabels: string[] = []
  for (let i = 1; i < count; i++) {
    if (i === 1) rankLabels.push(isEn ? '🥇 1st' : '🥇 1등')
    else if (i === 2) rankLabels.push(isEn ? '🥈 2nd' : '🥈 2등')
    else if (i === 3) rankLabels.push(isEn ? '🥉 3rd' : '🥉 3등')
    else rankLabels.push(isEn ? `${i}th` : `${i}등`)
  }
  const slots = [...rankLabels, isEn ? '🎉 Winner' : '🎉 당첨']
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]]
  }
  return slots
}

const LADDER_ROWS = 12

function generateRungs(cols: number): boolean[][] {
  const rungs: boolean[][] = Array.from({ length: LADDER_ROWS }, () => Array(cols - 1).fill(false))
  for (let row = 0; row < LADDER_ROWS; row++) {
    for (let col = 0; col < cols - 1; col++) {
      if (col > 0 && rungs[row][col - 1]) continue
      if (Math.random() < 0.42) rungs[row][col] = true
    }
  }
  return rungs
}

function tracePath(startCol: number, rungs: boolean[][]): number[] {
  const path = [startCol]
  let col = startCol
  for (let row = 0; row < LADDER_ROWS; row++) {
    if (col < rungs[row].length && rungs[row][col]) col += 1
    else if (col > 0 && rungs[row][col - 1]) col -= 1
    path.push(col)
  }
  return path
}

function getAnimalColor(id: string) {
  const map: Record<string, string> = {
    lion: '#E65100', tiger: '#F57F17', panda: '#455A64',
    pig: '#C2185B', fox: '#BF360C', rabbit: '#7B1FA2',
    bear: '#4E342E', sheep: '#00695C',
  }
  return map[id] ?? '#888'
}

type Phase = 'setup' | 'play' | 'animating' | 'done'

export default function LadderPage() {
  const locale = useLocale()
  const isEn = locale === 'en'

  const [phase, setPhase] = useState<Phase>('setup')
  const [count, setCount] = useState(4)
  const [animals, setAnimals] = useState(ALL_ANIMALS.slice(0, 4))
  const [rungs, setRungs] = useState<boolean[][]>([])
  const [resultSlots, setResultSlots] = useState<string[]>([])
  const [editingCol, setEditingCol] = useState<number | null>(null)

  // 애니메이션 상태: 몇 번째 동물까지 경로가 표시됐는지
  const [revealedPaths, setRevealedPaths] = useState<Record<string, number[]>>({})
  const [animatingIdx, setAnimatingIdx] = useState<number>(-1) // 현재 내려가고 있는 동물 index
  const allPaths = useRef<Record<string, number[]>>({})

  const { shareWithCapture } = useKakaoShare()

  const startGame = useCallback(() => {
    const chosen = ALL_ANIMALS.slice(0, count)
    const newRungs = generateRungs(count)
    const newSlots = buildResultSlots(count, isEn)
    setAnimals(chosen)
    setRungs(newRungs)
    setResultSlots(newSlots)
    setRevealedPaths({})
    allPaths.current = {}
    setAnimatingIdx(-1)
    setEditingCol(null)
    setPhase('play')
  }, [count, isEn])

  // 결과 공개: 동물을 하나씩 순서대로 애니메이션
  const revealAll = useCallback(() => {
    if (phase !== 'play') return
    // 모든 경로 미리 계산
    const paths: Record<string, number[]> = {}
    animals.forEach((a, i) => { paths[a.id] = tracePath(i, rungs) })
    allPaths.current = paths
    setRevealedPaths({})
    setAnimatingIdx(0)
    setPhase('animating')
  }, [phase, animals, rungs])

  // 애니메이션: animatingIdx가 바뀔 때마다 해당 동물 경로 추가 후 다음 동물로
  useEffect(() => {
    if (phase !== 'animating') return
    if (animatingIdx < 0 || animatingIdx >= animals.length) return

    const animal = animals[animatingIdx]
    const path = allPaths.current[animal.id]

    // 경로 추가
    setRevealedPaths(prev => ({ ...prev, [animal.id]: path }))

    // 다음 동물로 넘어가는 딜레이 (경로 길이에 비례)
    const delay = 1200 // ms: 한 동물이 내려가는 시간
    const timer = setTimeout(() => {
      if (animatingIdx + 1 < animals.length) {
        setAnimatingIdx(animatingIdx + 1)
      } else {
        // 모든 동물 완료
        setPhase('done')
        setAnimatingIdx(-1)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [animatingIdx, phase, animals])

  const reset = () => {
    setPhase('setup')
    setRevealedPaths({})
    allPaths.current = {}
    setAnimatingIdx(-1)
    setEditingCol(null)
  }

  const handleKakaoShare = useCallback(() => {
    const resultLines = resultSlots.map((label, col) => {
      const winner = Object.entries(revealedPaths).find(([, path]) => path[LADDER_ROWS] === col)
      const winAnimal = winner ? animals.find(a => a.id === winner[0]) : null
      const animalName = winAnimal ? (isEn ? winAnimal.nameEn : winAnimal.name) : '❓'
      return `${winAnimal ? winAnimal.emoji + ' ' + animalName : '❓'} → ${label}`
    }).join(' | ')

    shareWithCapture({
      captureId: 'ladder-capture',
      title: isEn ? '🪜 Ladder Game Result!' : '🪜 사다리 게임 결과!',
      description: resultLines,
      buttonText: isEn ? 'Play Ladder Game →' : '나도 사다리 타기 →',
      pageUrl: 'https://dasangdam.com/services/ladder',
    })
  }, [resultSlots, revealedPaths, animals, shareWithCapture, isEn])

  const SVG_TOTAL_W = 320
  const PAD_X = 28
  const usableW = SVG_TOTAL_W - PAD_X * 2
  const COL_GAP = animals.length > 1 ? usableW / (animals.length - 1) : usableW
  const ROW_GAP = 28
  const PAD_Y = 6
  const svgH = PAD_Y * 2 + LADDER_ROWS * ROW_GAP
  const cx = (col: number) => PAD_X + col * COL_GAP
  const cy = (row: number) => PAD_Y + row * ROW_GAP

  // 현재 애니메이션 중인 동물의 현재 위치 (row 기준)
  const currentAnimal = animatingIdx >= 0 && animatingIdx < animals.length
    ? animals[animatingIdx]
    : null

  // ── SETUP ──
  if (phase === 'setup') {
    return (
      <main className="min-h-screen flex flex-col items-center py-8 px-4"
        style={{ background: 'linear-gradient(160deg,#FDFBF7 0%,#F3ECD9 100%)' }}>
        <Link href="/" className="self-start text-sm text-amber-800/50 hover:text-amber-800 mb-6">
          ← {isEn ? 'Dasangdam' : '다상담'}
        </Link>
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🪜</div>
          <h1 className="text-2xl font-bold text-amber-900">{isEn ? 'Ladder Game' : '사다리 게임'}</h1>
          <p className="text-sm text-amber-800/60 mt-1">{isEn ? 'How many players?' : '몇 명이서 할까요?'}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {[2,3,4,5,6,7,8].map(n => (
            <button key={n} onClick={() => setCount(n)}
              className={`w-12 h-12 rounded-2xl text-lg font-bold transition-all
                ${count === n ? 'bg-amber-500 text-white shadow-lg scale-110' : 'bg-white text-amber-800 shadow'}`}>
              {n}
            </button>
          ))}
        </div>

        {/* 선택된 동물 미리보기 */}
        <div className="flex gap-3 flex-wrap justify-center mb-6">
          {ALL_ANIMALS.slice(0, count).map(a => (
            <div key={a.id} className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 bg-white rounded-2xl shadow flex items-center justify-center text-3xl">{a.emoji}</div>
              <span className="text-xs text-amber-800/60">{isEn ? a.nameEn : a.name}</span>
            </div>
          ))}
        </div>

        {/* 결과 미리보기 */}
        <div className="mb-8 text-center">
          <p className="text-xs text-amber-700/50 mb-2">
            {isEn ? 'Result composition' : '이번 게임 결과 구성'}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="px-3 py-1 bg-amber-500 text-white rounded-xl text-sm font-bold">
              {isEn ? '🎉 1 Winner' : '🎉 당첨 1명'}
            </span>
            <span className="px-3 py-1 bg-white text-amber-800 rounded-xl text-sm font-bold shadow">
              {isEn ? `🏅 ${count - 1} Ranked` : `🏅 순위 ${count - 1}명`}
            </span>
          </div>
        </div>

        <button onClick={startGame}
          className="w-full max-w-xs py-4 bg-amber-500 text-white rounded-3xl font-bold text-lg shadow-lg hover:bg-amber-600 active:scale-95 transition-all">
          {isEn ? 'Start Game! 🎮' : '게임 시작! 🎮'}
        </button>
      </main>
    )
  }

  // ── PLAY / ANIMATING / DONE ──
  return (
    <main className="min-h-screen flex flex-col items-center py-4 px-3"
      style={{ background: 'linear-gradient(160deg,#FDFBF7 0%,#F3ECD9 100%)' }}>
      <div className="w-full" style={{ maxWidth: SVG_TOTAL_W + 24 }}>

        {/* 헤더 */}
        <div className="flex items-center mb-3">
          <button onClick={reset} disabled={phase === 'animating'}
            className="text-sm text-amber-800/50 hover:text-amber-800 disabled:opacity-30">
            ← {isEn ? 'Back' : '처음으로'}
          </button>
          <span className="text-xs text-amber-800/40 ml-auto">
            {phase === 'done'
              ? (isEn ? '🎉 Results!' : '🎉 결과 공개!')
              : phase === 'animating'
              ? `${currentAnimal?.emoji} ${isEn ? 'Climbing...' : '내려가는 중...'}`
              : (isEn ? 'Press Reveal to start 🎊' : '결과 공개를 눌러보세요 🎊')}
          </span>
        </div>

        {/* 동물 상단 */}
        <div className="relative flex mb-0" style={{ height: 52 }}>
          {animals.map((a, i) => {
            const isRevealed = !!revealedPaths[a.id]
            const isAnimatingNow = animatingIdx === i
            return (
              <div key={a.id}
                style={{ position: 'absolute', left: cx(i) - 22, width: 44 }}
                className="flex flex-col items-center">
                <motion.div
                  animate={isAnimatingNow
                    ? { scale: [1, 1.2, 1.15], y: [0, -6, -4] }
                    : isRevealed
                    ? { scale: 0.85, opacity: 0.45 }
                    : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, repeat: isAnimatingNow ? Infinity : 0, repeatType: 'mirror' }}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl
                    ${isAnimatingNow ? 'bg-amber-200 ring-2 ring-amber-500 shadow-lg' :
                      isRevealed ? 'bg-white/50' : 'bg-white shadow-md'}`}>
                  {a.emoji}
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* 사다리 SVG */}
        <div className="rounded-2xl overflow-hidden bg-amber-50/40">
          <svg width="100%" viewBox={`0 0 ${SVG_TOTAL_W} ${svgH}`}>
            {/* 세로 기둥 */}
            {animals.map((_, col) => (
              <line key={col}
                x1={cx(col)} y1={cy(0)} x2={cx(col)} y2={cy(LADDER_ROWS)}
                stroke="#C4874A" strokeWidth="4.5" strokeLinecap="round" />
            ))}

            {/* 가로 발판 - 경로가 지나간 것만 표시 */}
            {rungs.map((rowRungs, row) =>
              rowRungs.map((hasRung, col) => {
                if (!hasRung) return null
                const isUsed = Object.values(revealedPaths).some(path => {
                  const c = path[row]
                  return c === col || c === col + 1
                })
                if (!isUsed && phase !== 'done') return null
                return (
                  <motion.line key={`${row}-${col}`}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.15 }}
                    x1={cx(col)} y1={cy(row)} x2={cx(col + 1)} y2={cy(row)}
                    stroke="#7B4F2E" strokeWidth="3.5" strokeLinecap="round" />
                )
              })
            )}

            {/* 각 동물 경로 선 */}
            {Object.entries(revealedPaths).map(([animalId, path]) => {
              const animal = animals.find(a => a.id === animalId)!
              const isAnimatingNow = currentAnimal?.id === animalId
              // polyline points
              const pts = path.map((col, row) => `${cx(col)},${cy(row)}`).join(' ')
              return (
                <motion.polyline key={animalId}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.0, ease: 'linear' }}
                  points={pts}
                  fill="none"
                  stroke={getAnimalColor(animal.id)}
                  strokeWidth={isAnimatingNow ? 4 : 3}
                  strokeDasharray={isAnimatingNow ? 'none' : '6 3'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9" />
              )
            })}

            {/* 아직 애니메이션 안 된 동물 경로는 안개로 가림 */}
            {(phase === 'play' || phase === 'animating') && (
              <>
                <defs>
                  <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FDF8F0" stopOpacity="0" />
                    <stop offset="25%" stopColor="#FDF8F0" stopOpacity="0.4" />
                    <stop offset="70%" stopColor="#FDF8F0" stopOpacity="0.88" />
                    <stop offset="100%" stopColor="#FDF8F0" stopOpacity="0.96" />
                  </linearGradient>
                </defs>
                <rect x="0" y={cy(1)} width={SVG_TOTAL_W} height={svgH}
                  fill="url(#fog)" pointerEvents="none" />
              </>
            )}
          </svg>
        </div>

        {/* 결과 슬롯 하단 */}
        {phase !== 'done' ? (
          <>
            <div className="relative flex mt-1 mb-2" style={{ height: 56 }}>
              {resultSlots.map((label, col) => {
                const isWinner = label.includes('당첨') || label.includes('Winner')
                const parts = label.split(' ')
                return (
                  <div key={col}
                    style={{ position: 'absolute', left: cx(col) - 22, width: 44 }}
                    className="flex flex-col items-center">
                    <button
                      onClick={() => phase === 'play' && setEditingCol(editingCol === col ? null : col)}
                      disabled={phase === 'animating'}
                      className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-center leading-tight shadow transition-all
                        ${isWinner
                          ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                          : editingCol === col
                          ? 'bg-amber-300 text-amber-900 ring-2 ring-amber-500'
                          : 'bg-white text-amber-800 hover:bg-amber-50'}`}>
                      <span className="text-base leading-none">{parts[0]}</span>
                      <span className="text-[9px] font-bold mt-0.5">{parts.slice(1).join(' ')}</span>
                    </button>
                  </div>
                )
              })}
            </div>
            {phase === 'play' && (
              <p className="text-center text-xs text-amber-700/40 mb-3">
                {isEn
                  ? '↑ Tap a slot to change it (🎉 Winner is placed automatically)'
                  : '↑ 결과를 눌러 내용을 바꿀 수 있어요 (🎉 당첨은 자동 배치)'}
              </p>
            )}
            {phase === 'animating' && (
              <div className="flex justify-center items-center gap-2 mb-3 py-2">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="text-2xl">{currentAnimal?.emoji}</motion.span>
                <span className="text-sm text-amber-700 font-bold">
                  {isEn ? 'Climbing the ladder...' : '사다리 타는 중...'}
                </span>
              </div>
            )}
          </>
        ) : (
          /* 최종 결과 카드 */
          <div className="mt-3 mb-4 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)` }}>
            {resultSlots.map((label, col) => {
              const winner = Object.entries(revealedPaths).find(([, path]) => path[LADDER_ROWS] === col)
              const winAnimal = winner ? animals.find(a => a.id === winner[0]) : null
              const isWinner = label.includes('당첨') || label.includes('Winner')
              const parts = label.split(' ')
              return (
                <motion.div key={col}
                  initial={{ opacity: 0, scale: 0.7, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: col * 0.07, type: 'spring', stiffness: 260, damping: 18 }}
                  className={`rounded-2xl p-3 flex flex-col items-center gap-1.5 border
                    ${isWinner
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-lg'
                      : 'bg-white border-amber-100 shadow-md'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-4xl
                    ${isWinner ? 'bg-amber-100' : 'bg-amber-50'} shadow-sm`}>
                    {winAnimal ? winAnimal.emoji : '❓'}
                  </div>
                  <span className={`text-xs font-bold ${isWinner ? 'text-amber-600' : 'text-amber-800'}`}>
                    {winAnimal
                      ? (isEn ? winAnimal.nameEn : winAnimal.name)
                      : (isEn ? 'Unknown' : '미결')}
                  </span>
                  <div className={`w-full rounded-xl py-1.5 flex flex-col items-center
                    ${isWinner ? 'bg-amber-500' : 'bg-amber-300'}`}>
                    <span className="text-lg leading-none">{parts[0]}</span>
                    <span className="text-[10px] font-bold text-white mt-0.5">{parts.slice(1).join(' ')}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* 결과값 편집 패널 */}
        <AnimatePresence>
          {editingCol !== null && phase === 'play' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="bg-white rounded-2xl p-4 mb-3 shadow-lg border border-amber-100">
              <p className="text-xs text-amber-700 mb-2 text-center font-bold">
                {isEn ? `Slot ${editingCol + 1} settings` : `${editingCol + 1}번 칸 결과 설정`}
                {(resultSlots[editingCol].includes('당첨') || resultSlots[editingCol].includes('Winner')) && (
                  <span className="ml-2 text-amber-500">
                    {isEn ? '(Winner slot — auto assigned)' : '(당첨 칸은 자동 지정)'}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                {(isEn
                  ? ['🏆 Champion', '🥇 1st', '🥈 2nd', '🥉 3rd', '🎁 Gift', '😱 Penalty', '💨 Miss', '⭐ Lucky']
                  : ['🏆 우승', '🥇 1등', '🥈 2등', '🥉 3등', '🎁 선물', '😱 벌칙', '💨 꽝', '⭐ 행운']
                ).map(preset => (
                  <button key={preset}
                    onClick={() => {
                      setResultSlots(prev => { const n = [...prev]; n[editingCol!] = preset; return n })
                      setEditingCol(null)
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all
                      ${resultSlots[editingCol] === preset
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}`}>
                    {preset}
                  </button>
                ))}
              </div>
              <input
                placeholder={isEn ? 'Type and press Enter...' : '직접 입력 후 Enter...'}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm text-amber-900 outline-none focus:border-amber-400"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setResultSlots(prev => { const n = [...prev]; n[editingCol!] = e.currentTarget.value.trim(); return n })
                    setEditingCol(null)
                  }
                }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 하단 버튼 */}
        <div className="mb-4">
          {phase === 'play' && (
            <button onClick={revealAll}
              className="w-full py-3.5 bg-amber-500 text-white rounded-2xl font-bold shadow-lg hover:bg-amber-600 active:scale-95 transition-all text-base">
              {isEn ? 'Reveal Results 🎊' : '결과 공개 🎊'}
            </button>
          )}
          {phase === 'animating' && (
            <button disabled
              className="w-full py-3.5 bg-amber-300 text-white rounded-2xl font-bold text-base opacity-80 cursor-not-allowed">
              {isEn ? 'Climbing... ⏳' : '사다리 타는 중... ⏳'}
            </button>
          )}
          {phase === 'done' && (
            <div className="flex flex-col gap-2">
              <button onClick={handleKakaoShare}
                className="w-full py-3.5 bg-[#FEE500] text-zinc-900 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C6.477 3 2 6.71 2 11.28c0 2.913 1.792 5.481 4.5 7.012L5.5 21l3.663-1.98C10.005 19.33 10.99 19.5 12 19.5c5.523 0 10-3.71 10-8.22C22 6.71 17.523 3 12 3z" fill="#3C1E1E" />
                </svg>
                {isEn ? 'Share via KakaoTalk' : '카카오톡으로 공유하기'}
              </button>
              <p className="text-center text-xs text-amber-700/50">
                {isEn ? 'Dasangdam ' : '다상담 '}
                <a href="https://dasangdam.com" target="_blank" rel="noopener noreferrer"
                  className="underline underline-offset-2">dasangdam.com</a>
              </p>
              <button onClick={reset}
                className="w-full py-3.5 bg-amber-500 text-white rounded-2xl font-bold shadow-lg hover:bg-amber-600 active:scale-95 transition-all">
                {isEn ? '🔄 Play Again' : '🔄 다시 하기'}
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
