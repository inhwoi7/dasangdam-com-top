// src/components/ladder/LadderCanvas.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { LadderRung, PlayerResult } from '@/types'

const ROWS = 12
const COL_WIDTH = 60
const ROW_HEIGHT = 32
const RAIL_WIDTH = 5
const PAD_X = 24
const PAD_Y = 20

function getX(col: number) {
  return PAD_X + col * COL_WIDTH
}
function getY(row: number) {
  return PAD_Y + row * ROW_HEIGHT
}

interface Props {
  revealRungs?: boolean
}

export default function LadderCanvas({ revealRungs = false }: Props) {
  const { animals, ladderRungs, resultSlots, results, playerResults, revealedPaths } = useGameStore()
  const cols = animals.length
  const svgWidth = PAD_X * 2 + (cols - 1) * COL_WIDTH
  const svgHeight = PAD_Y * 2 + ROWS * ROW_HEIGHT

  // Get path segments for a result
  const getPathPoints = (result: PlayerResult) => {
    const points: { x: number; y: number }[] = []
    for (let i = 0; i < result.path.length; i++) {
      points.push({ x: getX(result.path[i]), y: getY(i) })
    }
    return points
  }

  const polylinePoints = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="overflow-visible"
    >
      {/* Vertical rails */}
      {animals.map((_, col) => (
        <line
          key={`rail-${col}`}
          x1={getX(col)} y1={getY(0)}
          x2={getX(col)} y2={getY(ROWS)}
          stroke="#C4874A"
          strokeWidth={RAIL_WIDTH}
          strokeLinecap="round"
        />
      ))}

      {/* Horizontal rungs — revealed only */}
      {ladderRungs.map((rung, i) => {
        const shouldShow = revealRungs || playerResults.some(r => {
          // Show rung if it's on a revealed path
          const col = r.path[rung.row]
          return revealedPaths.includes(r.animalId) && (col === rung.colLeft || col === rung.colLeft + 1)
        })
        return shouldShow ? (
          <motion.line
            key={`rung-${i}`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: rung.row * 0.04 }}
            x1={getX(rung.colLeft)}
            y1={getY(rung.row)}
            x2={getX(rung.colLeft + 1)}
            y2={getY(rung.row)}
            stroke="#8B5230"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        ) : null
      })}

      {/* Fog/blind overlay for unrevealed area */}
      {!revealRungs && (
        <rect
          x={0} y={getY(0) - 4}
          width={svgWidth} height={getY(ROWS) - getY(0) + 8}
          fill="url(#fogGradient)"
          pointerEvents="none"
        />
      )}

      {/* Paths for revealed animals */}
      {playerResults
        .filter(r => revealedPaths.includes(r.animalId))
        .map(result => {
          const animal = animals.find(a => a.id === result.animalId)
          if (!animal) return null
          const pts = getPathPoints(result)
          return (
            <motion.polyline
              key={`path-${result.animalId}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              points={polylinePoints(pts)}
              fill="none"
              stroke={animal.color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 3"
            />
          )
        })}

      {/* Defs */}
      <defs>
        <linearGradient id="fogGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3ECD9" stopOpacity="0" />
          <stop offset="30%" stopColor="#F3ECD9" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#F3ECD9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F3ECD9" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  )
}
