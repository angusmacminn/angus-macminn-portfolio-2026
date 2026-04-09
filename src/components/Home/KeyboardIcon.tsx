'use client'
import { motion, useReducedMotion } from 'motion/react'

const KEY_WIDTH = 3.6
const KEY_HEIGHT = 2.7
const KEY_GAP = 1.7
const VIEWBOX_CENTER_X = 20

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453123
  return x - Math.floor(x)
}

const keyVariants = {
  rest: { y: 0 },
  hover: (i: number) => ({
    y: [0, -(1 + pseudoRandom(i + 1) * 1.25), 0],
    transition: {
      duration: 0.3 + pseudoRandom(i + 7) * 0.35,
      delay: (i % 3) * 0.03 + pseudoRandom(i + 13) * 0.16,
      repeat: Infinity,
      repeatDelay: pseudoRandom(i + 17) * 0.22,
      repeatType: 'loop' as const,
      ease: 'easeInOut' as const,
    },
  }),
}

const getRowStartX = (count: number) => {
  const rowWidth = count * KEY_WIDTH + (count - 1) * KEY_GAP
  return VIEWBOX_CENTER_X - rowWidth / 2
}

export function KeyboardIcon() {
  const reduce = useReducedMotion()

  return (
    <motion.svg width="40" height="30" viewBox="0 0 40 30" aria-hidden>
      {/* keyboard frame */}
      <rect x="1.5" y="2.5" width="37" height="25" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />

      {/* top row: 6 keys */}
      {[0, 1, 2, 3, 4, 5].map((keyIndex) => (
        <motion.rect
          key={`r1-${keyIndex}`}
          x={getRowStartX(6) + keyIndex * (KEY_WIDTH + KEY_GAP)}
          y={8}
          width={KEY_WIDTH}
          height={KEY_HEIGHT}
          rx={0.8}
          fill="currentColor"
          variants={reduce ? undefined : keyVariants}
          custom={keyIndex}
        />
      ))}

      {/* middle row: 5 keys */}
      {[0, 1, 2, 3, 4].map((keyIndex) => (
        <motion.rect
          key={`r2-${keyIndex}`}
          x={getRowStartX(5) + keyIndex * (KEY_WIDTH + KEY_GAP)}
          y={13}
          width={KEY_WIDTH}
          height={KEY_HEIGHT}
          rx={0.8}
          fill="currentColor"
          variants={reduce ? undefined : keyVariants}
          custom={keyIndex + 6}
        />
      ))}

      {/* bottom row: 4 keys */}
      {[0, 1, 2, 3].map((keyIndex) => (
        <motion.rect
          key={`r3-${keyIndex}`}
          x={getRowStartX(4) + keyIndex * (KEY_WIDTH + KEY_GAP)}
          y={18}
          width={KEY_WIDTH}
          height={KEY_HEIGHT}
          rx={0.8}
          fill="currentColor"
          variants={reduce ? undefined : keyVariants}
          custom={keyIndex + 11}
        />
      ))}
    </motion.svg>
  )
}