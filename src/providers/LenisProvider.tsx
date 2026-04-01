'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import React, { useEffect, useSyncExternalStore } from 'react'

import 'lenis/dist/lenis.css'

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServerSnapshot() {
  return false
}

/** Resets scroll on client navigations so new pages start at the top (Lenis + Next.js). */
function LenisRouteSync() {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true })
  }, [pathname, lenis])

  return null
}

export const LenisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  )

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: prefersReducedMotion ? 1 : 0.09,
        smoothWheel: !prefersReducedMotion,
        stopInertiaOnNavigate: true,
      }}
    >
      <LenisRouteSync />
      {children}
    </ReactLenis>
  )
}
