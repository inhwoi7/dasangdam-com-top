// lib/ladderTypes.ts

export type Animal = {
  id: string
  name: string
  emoji: string
  color: string
  bgColor: string
}

export type GameStep = 'setup' | 'result-setup' | 'game' | 'final'

export type ResultChip = {
  id: string
  label: string
  emoji: string
  color: string
  bgColor: string
}

export type LadderRung = {
  row: number
  colLeft: number
}

export type PlayerResult = {
  animalId: string
  resultChipId: string
  path: number[]
}

export type GameStore = {
  step: GameStep
  playerCount: number
  animals: Animal[]
  selectedAnimalId: string | null
  results: ResultChip[]
  resultSlots: (string | null)[]
  ladderRungs: LadderRung[]
  playerResults: PlayerResult[]
  revealedPaths: string[]

  setStep: (step: GameStep) => void
  setPlayerCount: (count: number) => void
  selectAnimal: (id: string | null) => void
  setResultSlot: (col: number, chipId: string | null) => void
  generateLadder: () => void
  runGame: (animalId: string) => void
  revealAll: () => void
  resetGame: () => void
}
