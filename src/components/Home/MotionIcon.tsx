'use client'

import { motion, useReducedMotion } from 'motion/react'

const RECT_1 = {
  rest: { x: 2.4, y: 2.4, width: 14.2, height: 8.2 },
  hover: {
    x: [2.4, 14.05, 2.4],
    y: [2.4, 2.2, 2.4],
    width: [14.2, 14.2, 14.2],
    height: [8.2, 7.6, 8.2],
    transition: {
      duration: 2.35,
      delay: 0.14,
      ease: [0.23, 1, 0.32, 1] as const,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
}

const RECT_2 = {
  rest: { x: 21.4, y: 8.4, width: 8.2, height: 11.2 },
  hover: {
    x: [21.4, 20.6, 21.4],
    y: [8.4, 16.2, 8.4],
    width: [8.2, 7.5, 8.2],
    height: [11.2, 11.75, 11.2],
    transition: {
      duration: 2.35,
      delay: 0.13,
      ease: [0.23, 1, 0.32, 1] as const,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
}

const RECT_3 = {
  rest: { x: 2.4, y: 14.7, width: 5.2, height: 16.2 },
  hover: {
    x: [2.4, 1.6, 2.4],
    y: [14.7, 2, 14.7],
    width: [5.2, 6.8, 5.2],
    height: [16.2, 14.9, 16.2],
    transition: {
      duration: 2.35,
      delay: 0.15,
      ease: [0.23, 1, 0.32, 1] as const,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
}

const CURSOR = {
  rest: { x: 0, y: 0, scale: 1.2, rotate: 0 },
  hover: {
    x: [0, -8.55, 0],
    y: [0, 0.5, 0],
    scale: [1, 1.38, 1],
    rotate: [0, 25.5, 0],
    transition: {
      duration: 2.35,
      delay: 0.1,
      ease: [0.23, 1, 0.32, 1] as const,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
}

export function MotionIcon() {
  const reduce = useReducedMotion()

  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <motion.rect
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1.6"
        variants={reduce ? undefined : RECT_1}
      />
      <motion.rect
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1.6"
        variants={reduce ? undefined : RECT_2}
      />
      <motion.rect
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1.6"
        variants={reduce ? undefined : RECT_3}
      />

      <motion.g
        variants={reduce ? undefined : CURSOR}
        style={{ transformOrigin: '14px 24px' }}
      >
        <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.9501 21.024C18.1782 20.4158 17.5842 19.8218 16.976 20.0499L10.4912 22.4817C9.76999 22.7521 9.86684 23.8015 10.6253 23.9353L13.5488 24.4512L14.0647 27.3747C14.1985 28.1332 15.2479 28.23 15.5183 27.5088L17.9501 21.024ZM17.2416 20.7584L14.8098 27.2432L14.2939 24.3197C14.2387 24.0065 13.9935 23.7613 13.6803 23.7061L10.7568 23.1902L17.2416 20.7584Z"
        fill="currentColor"
      />
        <path d="M10.5 23.5V23L17.5 20.5L15 27.5H14.5L14 24L10.5 23.5Z" fill="currentColor" />
      </motion.g>
    </motion.svg>
  )
}
