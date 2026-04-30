// src/components/ladder/SetupStep.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, ANIMALS } from '@/store/gameStore'

export default function SetupStep() {
  const { playerCount, animals, selectedAnimalId, setPlayerCount, selectAnimal, setStep, generateLadder } = useGameStore()

  const handleNext = () => {
    generateLadder()
    setStep('result-setup')
  }

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-warm-brown/60 text-sm font-medium tracking-widest mb-1">STEP 1</p>
        <h2 className="text-2xl font-display text-warm-brown font-bold">참여 인원을 선택해요</h2>
        <p className="text-warm-brown/50 text-sm mt-1">나의 동물 친구를 골라보세요 🎉</p>
      </motion.div>

      {/* Player count selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {[2, 3, 4, 5, 6, 7, 8].map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.92 }}
            onClick={() => setPlayerCount(n)}
            className={`w-11 h-11 rounded-2xl text-base font-bold transition-all shadow-warm-sm
              ${playerCount === n
                ? 'bg-warm-orange text-white shadow-warm-md'
                : 'bg-cream-100 text-warm-brown/60 hover:bg-cream-200'
              }`}
          >
            {n}
          </motion.button>
        ))}
        <span className="self-center text-sm text-warm-brown/40 ml-1">명</span>
      </div>

      {/* Animal grid */}
      <div
        className="grid gap-3 w-full max-w-sm"
        style={{ gridTemplateColumns: `repeat(${Math.min(playerCount, 4)}, 1fr)` }}
      >
        <AnimatePresence>
          {animals.map((animal, i) => (
            <motion.button
              key={animal.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => selectAnimal(selectedAnimalId === animal.id ? null : animal.id)}
              className={`relative flex flex-col items-center gap-1 p-4 rounded-3xl transition-all shadow-card
                ${selectedAnimalId === animal.id
                  ? 'ring-2 ring-warm-orange shadow-warm-md'
                  : 'hover:shadow-warm-sm'
                }`}
              style={{ backgroundColor: animal.bgColor }}
            >
              <span className="text-4xl leading-none">{animal.emoji}</span>
              <span className="text-xs font-bold" style={{ color: animal.color }}>{animal.name}</span>
              {selectedAnimalId === animal.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-warm-orange rounded-full flex items-center justify-center text-white text-xs font-bold shadow-warm-sm"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Animal Confirm Popup */}
      <AnimatePresence>
        {selectedAnimalId && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-warm-lg border border-cream-200 text-center"
          >
            <div className="text-4xl mb-2">
              {animals.find(a => a.id === selectedAnimalId)?.emoji}
            </div>
            <p className="text-warm-brown font-bold text-lg">
              {animals.find(a => a.id === selectedAnimalId)?.name}(으)로 참가!
            </p>
            <p className="text-warm-brown/50 text-sm mt-1">나의 동물 친구로 선택했어요 😊</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleNext}
        className="w-full max-w-xs py-4 bg-warm-orange text-white rounded-3xl font-bold text-lg shadow-warm-md hover:bg-orange-600 transition-colors"
      >
        결과값 설정하기 →
      </motion.button>
    </div>
  )
}
