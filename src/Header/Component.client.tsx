'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import './component.client.scss'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { X } from 'lucide-react'

/** Strong ease-out */
const EASE_OUT = [0.23, 1, 0.32, 1] as const
const DURATION_BACKDROP = 0.22
const DURATION_BACKDROP_EXIT = 0.16
const DURATION_PANEL = 0.28
const DURATION_PANEL_EXIT = 0.2
const INSTANT = { duration: 0.01 }

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduce(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return reduce
}

interface HeaderClientProps {
  data: Header
}

const MobileMenuIcon = ({ open }: { open: boolean }) => (
  <svg aria-hidden className="site-header__menu-icon" width="28" height="22" viewBox="0 0 28 22">
    {open ? (
      <>
        <line
          x1="3"
          y1="3"
          x2="25"
          y2="19"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="25"
          y1="3"
          x2="3"
          y2="19"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <rect x="0" y="4" width="28" height="4" rx="2" fill="currentColor" />
        <rect x="0" y="14" width="28" height="4" rx="2" fill="currentColor" />
      </>
    )}
  </svg>
)

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const reduceMotion = usePrefersReducedMotion()
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const mobileCloseRef = useRef<HTMLButtonElement>(null)
  const mobileNavOpenRef = useRef(mobileNavOpen)
  mobileNavOpenRef.current = mobileNavOpen

  useEffect(() => {
    setHeaderTheme(null)
    setMobileNavOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    const panel = document.getElementById('primary-mobile-nav')
    if (!panel) return
    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.closest('[aria-hidden="true"]'))
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileNavOpen])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    if (!mobileNavOpen) return
    const id = requestAnimationFrame(() => {
      mobileCloseRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [mobileNavOpen])

  const backdropTransition = reduceMotion
    ? INSTANT
    : { duration: DURATION_BACKDROP, ease: EASE_OUT }

  const backdropExitTransition = reduceMotion
    ? INSTANT
    : { duration: DURATION_BACKDROP_EXIT, ease: EASE_OUT }

  const panelTransition = reduceMotion
    ? INSTANT
    : { duration: DURATION_PANEL, ease: EASE_OUT }

  const panelInitial = reduceMotion ? { opacity: 0 } : { opacity: 1, x: '100%' }
  const panelAnimate = reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
  const panelExit = reduceMotion
    ? { opacity: 0, transition: INSTANT }
    : {
        opacity: 1,
        x: '100%',
        transition: { duration: DURATION_PANEL_EXIT, ease: EASE_OUT },
      }

  return (
    <header className="site-header" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="container">
        <div className="site-header__inner">
          <div className="site-header__start">
            <div className="site-header__start-collapsible">
              <Link href="/" aria-label="Angus MacMinn — go to homepage">
                <Logo loading="eager" priority="high" className="site-header__logo" />
              </Link>
              <div className="site-header__theme site-header__theme--mobile">
                <ThemeSelector />
              </div>
            </div>
          </div>

          <HeaderNav data={data} variant="desktop" />

          <div className="site-header__end">
            <div className="site-header__theme site-header__theme--desktop">
              <ThemeSelector />
            </div>
            <button
              ref={menuToggleRef}
              aria-controls="primary-mobile-nav"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              className="site-header__menu-toggle"
              onClick={() => setMobileNavOpen((o) => !o)}
              type="button"
            >
              <MobileMenuIcon open={mobileNavOpen} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence
        mode="sync"
        onExitComplete={() => {
          if (!mobileNavOpenRef.current) menuToggleRef.current?.focus()
        }}
      >
        {mobileNavOpen ? (
          <motion.div
            key="mobile-nav-backdrop"
            aria-hidden
            className="site-header__mobile-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: backdropExitTransition }}
            transition={backdropTransition}
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}
        {mobileNavOpen ? (
          <motion.div
            key="mobile-nav-panel"
            className="site-header__mobile-panel"
            id="primary-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={panelTransition}
          >
            <div className="site-header__mobile-panel-top">
              <button
                ref={mobileCloseRef}
                aria-label="Close menu"
                className="site-header__mobile-close"
                onClick={() => setMobileNavOpen(false)}
                type="button"
              >
                <X aria-hidden size={26} strokeWidth={2} />
              </button>
            </div>
            <HeaderNav data={data} variant="mobile" onLinkClick={() => setMobileNavOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
