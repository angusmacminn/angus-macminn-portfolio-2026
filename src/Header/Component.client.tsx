'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import './component.client.scss'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { X } from 'lucide-react'

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
  const [headerScrollCompact, setHeaderScrollCompact] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

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
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let raf = 0
    let lastY = window.scrollY

    const tick = () => {
      const y = window.scrollY
      if (mobileNavOpen) {
        setHeaderScrollCompact(false)
        lastY = y
        return
      }

      const delta = y - lastY
      const threshold = 56

      if (y < threshold * 0.4) {
        setHeaderScrollCompact(false)
      } else if (delta > 2) {
        setHeaderScrollCompact(true)
      } else if (delta < -2) {
        setHeaderScrollCompact(false)
      }
      lastY = y
    }

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }

    onScrollOrResize()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [mobileNavOpen])

  return (
    <header
      className={`site-header container${headerScrollCompact ? ' site-header--scroll-compact' : ''}`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="site-header__inner">
        <div className="site-header__start">
          <div className="site-header__start-collapsible">
            <Link href="/">
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

      {mobileNavOpen ? (
        <div className="site-header__mobile-overlay">
          <div
            aria-hidden
            className="site-header__mobile-backdrop"
            onClick={() => setMobileNavOpen(false)}
            role="presentation"
          />
          <div className="site-header__mobile-panel" id="primary-mobile-nav" role="dialog" aria-modal="true">
            <div className="site-header__mobile-panel-top">
              <button
                aria-label="Close menu"
                className="site-header__mobile-close"
                onClick={() => setMobileNavOpen(false)}
                type="button"
              >
                <X aria-hidden size={26} strokeWidth={2} />
              </button>
            </div>
            <HeaderNav data={data} variant="mobile" onLinkClick={() => setMobileNavOpen(false)} />
          </div>
        </div>
      ) : null}
    </header>
  )
}
