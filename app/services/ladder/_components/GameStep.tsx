// src/components/ladder/GameStep.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import LadderCanvas from './LadderCanvas'

export default function GameStep() {
  const {
    animals, results, resultSlots, playerResults,
    revealedPaths, selectedAnimalId, runGame, revealAll, setStep
  } = useGameStore()
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState<{ animal: typeof animals[0]; chip: typeof results[0] } | null>(null)

  const handleAnimalClick = (animalId: string) => {
    if (revealedPaths.includes(animalId)) return
    runGame(animalId)
    // Show result popup after animation (1.4s)
    setTimeout(() => {
      const pr = useGameStore.getState().playerResults.find(r => r.animalId === animalId)
      if (!pr) return
      const animal = animals.find(a => a.id === animalId)!
      const chip = results.find(r => r.id === pr.resultChipId) ?? results[results.length - 1]
      setLastResult({ animal, chip })
      setShowResult(true)
    }, 1400)
  }

  const allRevealed = revealedPaths.length === animals.length

  return (
    <div className="flex flex-col gap-4 py-2">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <p className="text-warm-brown/60 text-sm font-medium tracking-widest mb-1">STEP 3</p>
        <h2 className="text-2xl font-display text-warm-brown font-bold">나의 동물을 클릭하세요!</h2>
        <p className="text-warm-brown/50 text-sm mt-1">사다리가 어디로 이어질까요? 🤩</p>
      </motion.div>

      {/* Animal row (top) */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${animals.length}, 1fr)` }}
      >
        {animals.map((animal) => {
          const isRevealed = revealedPaths.includes(animal.id)
          const isSelected = selectedAnimalId === animal.id
          return (
            <motion.button
              key={animal.id}
              whileHover={!isRevealed ? { scale: 1.08, y: -4 } : {}}
              whileTap={!isRevealed ? { scale: 0.92 } : {}}
              onClick={() => handleAnimalClick(animal.id)}
              disabled={isRevealed}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all shadow-card
                ${isRevealed ? 'opacity-50' : 'hover:shadow-warm-md cursor-pointer'}
                ${isSelected && !isRevealed ? 'ring-2 ring-warm-orange' : ''}
              `}
              style={{ backgroundColor: animal.bgColor }}
            >
              <span className="text-3xl">{animal.emoji}</span>
              <span className="text-[11px] font-bold" style={{ color: animal.color }}>{animal.name}</span>
              {isRevealed && <span className="text-[10px] text-green-600 font-bold">완료!</span>}
            </motion.button>
          )
        })}
      </div>

      {/* Ladder */}
      <div className="relative bg-cream-200/50 rounded-3xl p-3 overflow-hidden">
        <LadderCanvas revealRungs={false} />
        {!allRevealed && (
          <div className="absolute inset-x-0 bottom-0 h-16 flex items-end justify-center pb-3 pointer-events-none">
            <p className="text-xs text-warm-brown/40 animate-pulse">사다리 경로가 숨겨져 있어요 👀</p>
          </div>
        )}
      </div>

      {/* Result chips at bottom (hidden) */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${animals.length}, 1fr)` }}
      >
        {resultSlots.map((chipId, col) => {
          const chip = results.find(r => r.id === chipId)
          const revealed = playerResults.find(r => r.path[r.path.length - 1] === col && revealedPaths.includes(r.animalId))
          return (
            <div
              key={col}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all min-h-[52px] justify-center
                ${revealed && chip ? 'shadow-warm-sm' : 'bg-cream-100/60'}`}
              style={revealed && chip ? { backgroundColor: chip.bgColor } : {}}
            >
              {revealed && chip ? (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xl">{chip.emoji}</span>
                  <span className="text-[11px] font-bold" style={{ color: chip.color }}>{chip.label}</span>
                </motion.div>
              ) : (
                <span className="text-lg text-warm-brown/20">?</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={revealAll}
          className="flex-1 py-3 bg-warm-gold text-white rounded-2xl font-bold shadow-warm-md hover:bg-yellow-500 transition-colors"
        >
          전체 공개 🎊
        </motion.button>
        {allRevealed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setStep('final')}
            className="flex-1 py-3 bg-warm-orange text-white rounded-2xl font-bold shadow-warm-md hover:bg-orange-600 transition-colors"
          >
            결과 확인 →
          </motion.button>
        )}
      </div>

      {/* Result popup */}
      <AnimatePresence>
        {showResult && lastResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-4xl p-8 text-center shadow-warm-lg w-full max-w-xs"
            >
              <div className="text-6xl mb-3">{lastResult.animal.emoji}</div>
              <h3 className="text-xl font-bold text-warm-brown mb-1">{lastResult.animal.name}</h3>
              <div
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl mt-3 text-2xl font-bold shadow-warm-sm"
                style={{ backgroundColor: lastResult.chip.bgColor, color: lastResult.chip.color }}
              >
                <span>{lastResult.chip.emoji}</span>
                <span>{lastResult.chip.label}</span>
              </div>
              <p className="text-warm-brown/40 text-sm mt-4">탭해서 닫기</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
