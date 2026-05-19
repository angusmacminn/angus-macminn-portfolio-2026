'use client'

import { motion, useReducedMotion } from 'motion/react'

const rightNodeVariants = {
  rest: { opacity: 0, scale: 0.82 },
  hover: {
    opacity: 1,
    scale: [1, 1.08, 1],
    transition: {
      opacity: {
        duration: 0.2,
        delay: 0.12,
        ease: 'easeOut' as const,
      },
      scale: {
        duration: 0.9,
        delay: 0.22,
        repeat: Infinity,
        repeatType: 'loop' as const,
        ease: 'easeInOut' as const,
      },
    },
  },
}

export function CMSIcon() {
  const reduce = useReducedMotion()

  return (
    <motion.svg width="100%" height="100%" viewBox="0 0 52 36" fill="none" aria-hidden>
      <rect x="4" y="4" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="20" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />

      <path d="M16 10H25C25.5523 10 26 10.4477 26 11V25.5C26 26.0523 25.5523 26.5 25 26.5H16" stroke="currentColor" strokeWidth="1.6" />
      <motion.path
        d="M26 18H36"
        stroke="currentColor"
        strokeWidth="1.6"
        variants={
          reduce
            ? undefined
            : {
                rest: { opacity: 0 },
                hover: {
                  opacity: 1,
                  transition: { duration: 0.2, delay: 0.12, ease: 'easeOut' as const },
                },
              }
        }
      />
      <motion.rect
        x={36}
        y={12}
        width={12}
        height={12}
        rx={1}
        stroke="currentColor"
        strokeWidth="1.6"
        variants={reduce ? undefined : rightNodeVariants}
        style={{ transformOrigin: '42px 18px' }}
      />
    </motion.svg>
  )
}
