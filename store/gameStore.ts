// store/gameStore.ts
import { create } from 'zustand'
import type { GameStore, Animal, ResultChip, LadderRung, PlayerResult } from '@/lib/ladderTypes'

const ANIMALS: Animal[] = [
  { id: 'lion',   name: '사자',   emoji: '🦁', color: '#8B5230', bgColor: '#FFF3E0' },
  { id: 'panda',  name: '판다',   emoji: '🐼', color: '#3D3D3D', bgColor: '#F5F5F5' },
  { id: 'pig',    name: '돼지',   emoji: '🐷', color: '#C06080', bgColor: '#FCE4EC' },
  { id: 'rabbit', name: '토끼',   emoji: '🐰', color: '#B0BEC5', bgColor: '#F3F4F6' },
  { id: 'bear',   name: '곰',     emoji: '🐻', color: '#795548', bgColor: '#EFEBE9' },
  { id: 'fox',    name: '여우',   emoji: '🦊', color: '#E65100', bgColor: '#FFF3E0' },
  { id: 'cat',    name: '고양이', emoji: '🐱', color: '#9C27B0', bgColor: '#F3E5F5' },
  { id: 'sheep',  name: '양',     emoji: '🐑', color: '#546E7A', bgColor: '#ECEFF1' },
]

export const DEFAULT_RESULT_CHIPS: ResultChip[] = [
  { id: 'first',   label: '1등',          emoji: '🏆', color: '#B8860B', bgColor: '#FFF9C4' },
  { id: 'second',  label: '2등',          emoji: '🥈', color: '#607D8B', bgColor: '#ECEFF1' },
  { id: 'third',   label: '3등',          emoji: '🥉', color: '#8D6E63', bgColor: '#EFEBE9' },
  { id: 'gift',    label: '선물',         emoji: '🎁', color: '#C62828', bgColor: '#FFEBEE' },
  { id: 'penalty', label: '벌칙',         emoji: '😱', color: '#4527A0', bgColor: '#EDE7F6' },
  { id: 'miss',    label: '꽝',           emoji: '💨', color: '#546E7A', bgColor: '#ECEFF1' },
  { id: 'lucky',   label: '행운',         emoji: '🍀', color: '#2E7D32', bgColor: '#E8F5E9' },
  { id: 'guest',   label: '오늘의 주인공', emoji: '⭐', color: '#E65100', bgColor: '#FFF3E0' },
]

function generateRungs(cols: number, rows: number): LadderRung[] {
  const rungs: LadderRung[] = []
  for (let row = 0; row < rows; row++) {
    const shuffled = [...Array(cols - 1).keys()].sort(() => Math.random() - 0.5)
    const used = new Set<number>()
    for (const col of shuffled) {
      if (!used.has(col) && !used.has(col - 1) && !used.has(col + 1)) {
        if (Math.random() < 0.4) {
          rungs.push({ row, colLeft: col })
          used.add(col)
        }
      }
    }
  }
  return rungs
}

function tracePath(startCol: number, rungs: LadderRung[], rows: number): number[] {
  const path: number[] = [startCol]
  let col = startCol
  for (let row = 0; row < rows; row++) {
    const rungLeft  = rungs.find(r => r.row === row && r.colLeft === col)
    const rungRight = rungs.find(r => r.row === row && r.colLeft === col - 1)
    if (rungLeft)  col = col + 1
    if (rungRight) col = col - 1
    path.push(col)
  }
  return path
}

export const useGameStore = create<GameStore>((set, get) => ({
  step: 'setup',
  playerCount: 4,
  animals: ANIMALS.slice(0, 4),
  selectedAnimalId: null,
  results: DEFAULT_RESULT_CHIPS,
  resultSlots: Array(4).fill(null),
  ladderRungs: [],
  playerResults: [],
  revealedPaths: [],

  setStep: (step) => set({ step }),

  setPlayerCount: (count) =>
    set({
      playerCount: count,
      animals: ANIMALS.slice(0, count),
      resultSlots: Array(count).fill(null),
      selectedAnimalId: null,
    }),

  selectAnimal: (id) => set({ selectedAnimalId: id }),

  setResultSlot: (col, chipId) =>
    set((state) => {
      const slots = [...state.resultSlots]
      if (chipId) {
        const existing = slots.indexOf(chipId)
        if (existing !== -1) slots[existing] = null
      }
      slots[col] = chipId
      return { resultSlots: slots }
    }),

  generateLadder: () => {
    const { playerCount } = get()
    const ROWS = 12
    const rungs = generateRungs(playerCount, ROWS)
    set({ ladderRungs: rungs, playerResults: [], revealedPaths: [] })
  },

  runGame: (animalId) => {
    const { animals, ladderRungs, resultSlots } = get()
    const idx = animals.findIndex(a => a.id === animalId)
    if (idx === -1) return
    const ROWS = 12
    const path = tracePath(idx, ladderRungs, ROWS)
    const finalCol = path[path.length - 1]
    const resultChipId = resultSlots[finalCol] ?? 'miss'
    const result: PlayerResult = { animalId, resultChipId, path }
    set((state) => ({
      playerResults: [...state.playerResults.filter(r => r.animalId !== animalId), result],
      revealedPaths: [...state.revealedPaths.filter(id => id !== animalId), animalId],
    }))
  },

  revealAll: () => {
    const { animals, ladderRungs, resultSlots } = get()
    const ROWS = 12
    const allResults: PlayerResult[] = animals.map((animal, idx) => {
      const path = tracePath(idx, ladderRungs, ROWS)
      const finalCol = path[path.length - 1]
      return { animalId: animal.id, resultChipId: resultSlots[finalCol] ?? 'miss', path }
    })
    set({
      playerResults: allResults,
      revealedPaths: animals.map(a => a.id),
      step: 'final',
    })
  },

  resetGame: () =>
    set({
      step: 'setup',
      playerCount: 4,
      animals: ANIMALS.slice(0, 4),
      selectedAnimalId: null,
      results: DEFAULT_RESULT_CHIPS,
      resultSlots: Array(4).fill(null),
      ladderRungs: [],
      playerResults: [],
      revealedPaths: [],
    }),
}))

export { ANIMALS }
