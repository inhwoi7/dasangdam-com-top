// src/components/ladder/StepIndicator.tsx
'use client'
import { motion } from 'framer-motion'
import type { GameStep } from '@/types'

const STEPS: { key: GameStep; label: string; emoji: string }[] = [
  { key: 'setup',        label: '인원 설정',  emoji: '👥' },
  { key: 'result-setup', label: '결과 설정',  emoji: '🎲' },
  { key: 'game',         label: '게임',       emoji: '🎮' },
  { key: 'final',        label: '결과',       emoji: '🏆' },
]

export default function StepIndicator({ current }: { current: GameStep }) {
  const currentIdx = STEPS.findIndex(s => s.key === current)

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {STEPS.map((step, i) => {
        const done    = i < currentIdx
        const active  = i === currentIdx
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all
              ${active  ? 'bg-warm-orange text-white shadow-warm-sm' : ''}
              ${done    ? 'bg-cream-300 text-warm-brown/70' : ''}
              ${!active && !done ? 'bg-cream-100 text-warm-brown/30' : ''}
            `}>
              <span>{step.emoji}</span>
              {active && <span>{step.label}</span>}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-0.5 rounded-full transition-all ${done ? 'bg-warm-orange' : 'bg-cream-300'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
