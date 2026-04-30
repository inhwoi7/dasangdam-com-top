// src/components/ladder/FinalStep.tsx
'use client'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import LadderCanvas from './LadderCanvas'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

export default function FinalStep() {
  const { animals, results, playerResults, resultSlots, resetGame } = useGameStore()

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#D4714A', '#E8A94B', '#7DAF7C', '#7BA7C9', '#9B87C4'],
    })
  }, [])

  return (
    <div className="flex flex-col gap-6 py-2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-4xl mb-2">🎊</div>
        <h2 className="text-2xl font-display text-warm-brown font-bold">최종 결과!</h2>
        <p className="text-warm-brown/50 text-sm mt-1">사다리의 비밀이 모두 공개되었어요</p>
      </motion.div>

      {/* Full ladder revealed */}
      <div className="bg-cream-200/50 rounded-3xl p-3">
        <LadderCanvas revealRungs={true} />
      </div>

      {/* Result summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {playerResults.map((pr, i) => {
          const animal = animals.find(a => a.id === pr.animalId)
          const chip = results.find(r => r.id === pr.resultChipId)
          if (!animal || !chip) return null
          return (
            <motion.div
              key={pr.animalId}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-warm-sm"
                style={{ backgroundColor: animal.bgColor }}
              >
                {animal.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-warm-brown/50">{animal.name}</p>
                <div
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-sm font-bold mt-0.5"
                  style={{ backgroundColor: chip.bgColor, color: chip.color }}
                >
                  <span>{chip.emoji}</span>
                  <span>{chip.label}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pb-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetGame}
          className="flex-1 py-4 bg-warm-orange text-white rounded-3xl font-bold text-lg shadow-warm-md hover:bg-orange-600 transition-colors"
        >
          🔄 다시 하기
        </motion.button>
      </div>
    </div>
  )
}
