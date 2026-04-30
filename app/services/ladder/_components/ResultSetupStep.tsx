// src/components/ladder/ResultSetupStep.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useGameStore } from '@/store/gameStore'
import type { ResultChip } from '@/types'

function DraggableChip({ chip, inSlot = false }: { chip: ResultChip; inSlot?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: chip.id,
    data: { chip },
  })

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        backgroundColor: chip.bgColor,
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl cursor-grab active:cursor-grabbing shadow-warm-sm select-none
        ${inSlot ? 'text-xs' : 'text-sm'}`}
    >
      <span className="text-base leading-none">{chip.emoji}</span>
      <span className="font-bold" style={{ color: chip.color }}>{chip.label}</span>
    </motion.div>
  )
}

function SlotDropZone({ col, animal, chipId }: { col: number; animal: { emoji: string; name: string; bgColor: string }; chipId: string | null }) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${col}` })
  const { results, setResultSlot } = useGameStore()
  const chip = results.find(r => r.id === chipId)

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Animal icon on top */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-warm-sm"
        style={{ backgroundColor: animal.bgColor }}
      >
        {animal.emoji}
      </div>

      {/* Drop slot */}
      <div
        ref={setNodeRef}
        className={`relative w-full min-h-[52px] rounded-2xl flex items-center justify-center transition-all border-2 border-dashed
          ${isOver
            ? 'border-warm-orange bg-orange-50 scale-105'
            : chip
              ? 'border-transparent'
              : 'border-cream-300 bg-cream-100/50'
          }`}
      >
        {chip ? (
          <div className="flex flex-col items-center gap-1 p-2">
            <DraggableChip chip={chip} inSlot />
            <button
              onClick={() => setResultSlot(col, null)}
              className="text-xs text-warm-brown/30 hover:text-warm-orange transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <p className="text-xs text-warm-brown/30 text-center px-1">여기에<br />놓아요</p>
        )}
      </div>
    </div>
  )
}

export default function ResultSetupStep() {
  const { animals, results, resultSlots, setResultSlot, setStep } = useGameStore()
  const [activeChip, setActiveChip] = useState<ResultChip | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const placedChipIds = resultSlots.filter(Boolean) as string[]
  const availableChips = results.filter(r => !placedChipIds.includes(r.id))

  const allSlotsSet = resultSlots.every(Boolean)

  const handleDragStart = (e: DragStartEvent) => {
    setActiveChip(e.active.data.current?.chip ?? null)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveChip(null)
    const { over, active } = e
    if (!over) return
    const overId = over.id.toString()
    if (overId.startsWith('slot-')) {
      const col = parseInt(overId.replace('slot-', ''))
      setResultSlot(col, active.id.toString())
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 py-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-warm-brown/60 text-sm font-medium tracking-widest mb-1">STEP 2</p>
          <h2 className="text-2xl font-display text-warm-brown font-bold">결과값을 설정해요</h2>
          <p className="text-warm-brown/50 text-sm mt-1">칩을 드래그해서 동물 아래에 놓아주세요 🎲</p>
        </motion.div>

        {/* Slot zones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${animals.length}, 1fr)` }}
        >
          {animals.map((animal, col) => (
            <SlotDropZone
              key={animal.id}
              col={col}
              animal={animal}
              chipId={resultSlots[col]}
            />
          ))}
        </motion.div>

        {/* Available chips pool */}
        <div className="bg-cream-100 rounded-3xl p-4">
          <p className="text-xs text-warm-brown/50 font-medium mb-3 text-center">결과 칩을 선택하세요</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {availableChips.map((chip) => (
              <DraggableChip key={chip.id} chip={chip} />
            ))}
            {availableChips.length === 0 && (
              <p className="text-sm text-warm-brown/40 py-2">모든 칩이 배치되었어요 🎉</p>
            )}
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setStep('setup')}
            className="flex-1 py-3 bg-cream-200 text-warm-brown rounded-2xl font-bold hover:bg-cream-300 transition-colors"
          >
            ← 이전
          </motion.button>
          <motion.button
            whileHover={allSlotsSet ? { scale: 1.02 } : {}}
            whileTap={allSlotsSet ? { scale: 0.97 } : {}}
            onClick={() => allSlotsSet && setStep('game')}
            className={`flex-[2] py-3 rounded-2xl font-bold text-lg transition-all
              ${allSlotsSet
                ? 'bg-warm-orange text-white shadow-warm-md hover:bg-orange-600'
                : 'bg-cream-200 text-warm-brown/30 cursor-not-allowed'
              }`}
          >
            게임 시작! 🎮
          </motion.button>
        </div>
      </div>

      <DragOverlay>
        {activeChip && (
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-warm-lg text-sm cursor-grabbing"
            style={{ backgroundColor: activeChip.bgColor }}
          >
            <span className="text-base">{activeChip.emoji}</span>
            <span className="font-bold" style={{ color: activeChip.color }}>{activeChip.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
