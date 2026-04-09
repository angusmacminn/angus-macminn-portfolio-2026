'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'

type Props = {
  className: string
  children: ReactNode
  icon?: ReactNode
}

export function ToolCardMotion({ className, children, icon }: Props) {
  return (
    <motion.div className={className} initial="rest" animate="rest" whileHover="hover" whileFocus="hover">
      {icon ? <div className="home-about__tools-icon">{icon}</div> : null}
      {children}
    </motion.div>
  )
}
