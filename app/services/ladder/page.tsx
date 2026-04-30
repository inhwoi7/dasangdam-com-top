'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const ALL_ANIMALS = [
  { id: 'lion',   emoji: '🦁', name: '사자' },
  { id: 'tiger',  emoji: '🐯', name: '호랑이' },
  { id: 'panda',  emoji: '🐼', name: '판다' },
  { id: 'pig',    emoji: '🐷', name: '돼지' },
  { id: 'fox',    emoji: '🦊', name: '여우' },
  { id: 'rabbit', emoji: '🐰', name: '토끼' },
  { id: 'bear',   emoji: '🐻', name: '곰' },
  { id: 'sheep',  emoji: '🐑', name: '양' },
]

const PRESET_RESULTS = ['🏆 1등', '🥈 2등', '🥉 3등', '🎁 선물', '😱 벌칙', '💨 꽝', '🍀 행운', '⭐ 주인공']

const LADDER_ROWS = 10

function generateRungs(cols: number): boolean[][] {
  const rungs: boolean[][] = Array.from({ length: LADDER_ROWS }, () => Array(cols - 1).fill(false))
  for (let row = 0; row < LADDER_ROWS; row++) {
    for (let col = 0; col < cols - 1; col++) {
      if (col > 0 && rungs[row][col - 1]) continue
      if (Math.random() < 0.4) rungs[row][col] = true
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

type Phase = 'setup' | 'play' | 'done'

export default function LadderPage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [count, setCount] = useState(4)
  const [animals, setAnimals] = useState(ALL_ANIMALS.slice(0, 4))
  const [rungs, setRungs] = useState<boolean[][]>([])
  const [resultSlots, setResultSlots] = useState<string[]>([])
  const [editingCol, setEditingCol] = useState<number | null>(null)
  const [revealed, setRevealed] = useState<Record<string, number[]>>({})

  const startGame = useCallback(() => {
    const chosen = ALL_ANIMALS.slice(0, count)
    setAnimals(chosen)
    setRungs(generateRungs(count))
    setResultSlots(Array.from({ length: count }, (_, i) => PRESET_RESULTS[i] ?? '💨 꽝'))
    setRevealed({})
    setEditingCol(null)
    setPhase('play')
  }, [count])

  const handleAnimalClick = useCallback((animalId: string, colIdx: number) => {
    if (revealed[animalId]) return
    setRevealed(prev => ({ ...prev, [animalId]: tracePath(colIdx, rungs) }))
  }, [revealed, rungs])

  const revealAll = useCallback(() => {
    const all: Record<string, number[]> = {}
    animals.forEach((a, i) => { all[a.id] = tracePath(i, rungs) })
    setRevealed(all)
    setPhase('done')
  }, [animals, rungs])

  const reset = () => { setPhase('setup'); setRevealed({}); setEditingCol(null) }

  const SVG_TOTAL_W = 320
  const PAD_X = 24
  const usableW = SVG_TOTAL_W - PAD_X * 2
  const COL_GAP = animals.length > 1 ? usableW / (animals.length - 1) : usableW
  const ROW_GAP = 30
  const PAD_Y = 6
  const svgH = PAD_Y * 2 + LADDER_ROWS * ROW_GAP
  const cx = (col: number) => PAD_X + col * COL_GAP
  const cy = (row: number) => PAD_Y + row * ROW_GAP

  // ── SETUP ──
  if (phase === 'setup') {
    return (
      <main className="min-h-screen flex flex-col items-center py-8 px-4"
        style={{ background: 'linear-gradient(160deg,#FDFBF7 0%,#F3ECD9 100%)' }}>
        <Link href="/" className="self-start text-sm text-amber-800/50 hover:text-amber-800 mb-6">← 다상담</Link>
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🪜</div>
          <h1 className="text-2xl font-bold text-amber-900">사다리 게임</h1>
          <p className="text-sm text-amber-800/60 mt-1">몇 명이서 할까요?</p>
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
        <div className="flex gap-3 flex-wrap justify-center mb-10">
          {ALL_ANIMALS.slice(0, count).map(a => (
            <div key={a.id} className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 bg-white rounded-2xl shadow flex items-center justify-center text-3xl">{a.emoji}</div>
              <span className="text-xs text-amber-800/60">{a.name}</span>
            </div>
          ))}
        </div>
        <button onClick={startGame}
          className="w-full max-w-xs py-4 bg-amber-500 text-white rounded-3xl font-bold text-lg shadow-lg hover:bg-amber-600 active:scale-95 transition-all">
          게임 시작! 🎮
        </button>
      </main>
    )
  }

  // ── PLAY / DONE ──
  return (
    <main className="min-h-screen flex flex-col items-center py-4 px-3"
      style={{ background: 'linear-gradient(160deg,#FDFBF7 0%,#F3ECD9 100%)' }}>
      <div className="w-full" style={{ maxWidth: SVG_TOTAL_W + 24 }}>

        {/* 헤더 */}
        <div className="flex items-center mb-3">
          <button onClick={reset} className="text-sm text-amber-800/50 hover:text-amber-800">← 처음으로</button>
          <span className="text-xs text-amber-800/40 ml-auto">
            {phase === 'done' ? '🎉 결과 공개!' : '동물을 눌러보세요 👆'}
          </span>
        </div>

        {/* 동물 상단 */}
        <div className="relative flex mb-0" style={{ height: 52 }}>
          {animals.map((a, i) => {
            const isRevealed = !!revealed[a.id]
            return (
              <motion.button key={a.id}
                whileHover={!isRevealed ? { scale: 1.15, y: -3 } : {}}
                whileTap={!isRevealed ? { scale: 0.88 } : {}}
                onClick={() => handleAnimalClick(a.id, i)}
                disabled={isRevealed}
                style={{ position: 'absolute', left: cx(i) - 22, width: 44 }}
                className="flex flex-col items-center">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl transition-all
                  ${isRevealed ? 'opacity-40 bg-white/50' : 'bg-white shadow-md'}`}>
                  {a.emoji}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* 사다리 SVG */}
        <div className="rounded-2xl overflow-hidden bg-amber-50/40">
          <svg width="100%" viewBox={`0 0 ${SVG_TOTAL_W} ${svgH}`}>
            {/* 세로대 */}
            {animals.map((_, col) => (
              <line key={col}
                x1={cx(col)} y1={cy(0)} x2={cx(col)} y2={cy(LADDER_ROWS)}
                stroke="#C4874A" strokeWidth="4.5" strokeLinecap="round" />
            ))}
            {/* 가로대 */}
            {rungs.map((rowRungs, row) =>
              rowRungs.map((hasRung, col) => {
                if (!hasRung) return null
                const show = phase === 'done' ||
                  Object.values(revealed).some(path => {
                    const c = path[row]; return c === col || c === col + 1
                  })
                if (!show) return null
                return (
                  <motion.line key={`${row}-${col}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: row * 0.025 }}
                    x1={cx(col)} y1={cy(row)} x2={cx(col + 1)} y2={cy(row)}
                    stroke="#7B4F2E" strokeWidth="3.5" strokeLinecap="round" />
                )
              })
            )}
            {/* 경로 점선 */}
            {Object.entries(revealed).map(([animalId, path]) => {
              const animal = animals.find(a => a.id === animalId)!
              const pts = path.map((col, row) => `${cx(col)},${cy(row)}`).join(' ')
              return (
                <motion.polyline key={animalId}
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.0, ease: 'easeInOut' }}
                  points={pts} fill="none"
                  stroke={getAnimalColor(animal.id)}
                  strokeWidth="3" strokeDasharray="6 3"
                  strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
              )
            })}
            {/* 안개 */}
            {phase !== 'done' && (
              <rect x="0" y={cy(1)} width={SVG_TOTAL_W} height={svgH}
                fill="url(#fog)" pointerEvents="none" />
            )}
            <defs>
              <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDF8F0" stopOpacity="0" />
                <stop offset="30%" stopColor="#FDF8F0" stopOpacity="0.5" />
                <stop offset="75%" stopColor="#FDF8F0" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FDF8F0" stopOpacity="0.97" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── 결과 슬롯 하단 ── */}
        {phase !== 'done' ? (
          // 게임 중: 작은 버튼으로 결과값 설정
          <>
            <div className="relative flex mt-1 mb-2" style={{ height: 52 }}>
              {resultSlots.map((label, col) => {
                const parts = label.split(' ')
                return (
                  <div key={col}
                    style={{ position: 'absolute', left: cx(col) - 22, width: 44 }}
                    className="flex flex-col items-center">
                    <button
                      onClick={() => setEditingCol(editingCol === col ? null : col)}
                      className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-center leading-tight shadow transition-all
                        ${editingCol === col
                          ? 'bg-amber-300 text-amber-900 ring-2 ring-amber-500'
                          : 'bg-white text-amber-800 hover:bg-amber-50'}`}>
                      <span className="text-base leading-none">{parts[0]}</span>
                      <span className="text-[9px] font-bold mt-0.5">{parts.slice(1).join(' ')}</span>
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="text-center text-xs text-amber-700/40 mb-3">
              ↑ 결과 버튼을 눌러 내용을 바꿀 수 있어요
            </p>
          </>
        ) : (
          // 결과 공개 후: 크게 동물 + 결과 카드
          <div className="mt-3 mb-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)` }}>
            {resultSlots.map((label, col) => {
              const winner = Object.entries(revealed).find(([, path]) => path[LADDER_ROWS] === col)
              const winAnimal = winner ? animals.find(a => a.id === winner[0]) : null
              const parts = label.split(' ')
              return (
                <motion.div key={col}
                  initial={{ opacity: 0, scale: 0.7, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: col * 0.07, type: 'spring', stiffness: 260, damping: 18 }}
                  className="bg-white rounded-2xl p-3 shadow-md flex flex-col items-center gap-1.5 border border-amber-100">
                  {/* 동물 크게 */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-4xl bg-amber-50 shadow-sm">
                    {winAnimal ? winAnimal.emoji : '❓'}
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {winAnimal ? winAnimal.name : '미결'}
                  </span>
                  {/* 결과값 */}
                  <div className="w-full bg-amber-400 rounded-xl py-1.5 flex flex-col items-center">
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
                {editingCol + 1}번 칸 결과 설정
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                {PRESET_RESULTS.map(preset => (
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
                placeholder="직접 입력 후 Enter..."
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

        {/* 버튼 */}
        <div className="mb-8">
          {phase === 'play' && (
            <button onClick={revealAll}
              className="w-full py-3.5 bg-amber-500 text-white rounded-2xl font-bold shadow-lg hover:bg-amber-600 active:scale-95 transition-all">
              결과 공개 🎊
            </button>
          )}
          {phase === 'done' && (
            <button onClick={reset}
              className="w-full py-3.5 bg-amber-500 text-white rounded-2xl font-bold shadow-lg hover:bg-amber-600 active:scale-95 transition-all">
              🔄 다시 하기
            </button>
          )}
        </div>

      </div>
    </main>
  )
}
