'use client'

import { motion } from 'motion/react'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

type MenuItem = {
  id: string
  label: string
}

export type ProjectSidebarMeta = {
  role?: string | null
  client?: string | null
  timeline?: string | null
  year?: number | null
}

const DOT_SIZE = 12
const ACTIVATION_OFFSET = 112
/** Ignore scroll-spy while smooth-scrolling to a clicked section (ms fallback if `scrollend` unsupported). */
const SCROLL_LOCK_MS = 900

function hasMeta(meta?: ProjectSidebarMeta) {
  if (!meta) return false
  return Boolean(meta.role || meta.client || meta.timeline || meta.year != null)
}

export function ProjectKickerSidebar({
  items,
  meta,
}: {
  items: MenuItem[]
  meta?: ProjectSidebarMeta
}) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')
  const [indicator, setIndicator] = useState({ top: 0, height: DOT_SIZE })
  const [reducedMotion, setReducedMotion] = useState(false)

  const navRef = useRef<HTMLElement>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const pendingTargetRef = useRef<string | null>(null)
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafIdRef = useRef(0)

  const showMeta = hasMeta(meta)
  const showNav = items.length > 0

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const setButtonRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(id, el)
    else buttonRefs.current.delete(id)
  }, [])

  const measureIndicator = useCallback(() => {
    const nav = navRef.current
    const btn = buttonRefs.current.get(activeId)
    if (!nav || !btn) return
    const top = btn.offsetTop + (btn.offsetHeight - DOT_SIZE) / 2
    setIndicator({ top, height: DOT_SIZE })
  }, [activeId])

  useLayoutEffect(() => {
    measureIndicator()
  }, [measureIndicator])

  useEffect(() => {
    const nav = navRef.current
    const onResize = () => measureIndicator()
    window.addEventListener('resize', onResize)
    const ro = nav ? new ResizeObserver(onResize) : null
    if (nav) ro?.observe(nav)
    return () => {
      window.removeEventListener('resize', onResize)
      ro?.disconnect()
    }
  }, [measureIndicator])

  const clearScrollLock = useCallback(() => {
    pendingTargetRef.current = null
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current)
      lockTimerRef.current = null
    }
  }, [])

  const getActiveSectionId = useCallback((): string => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!elements.length) return items[0]?.id ?? ''

    const atPageBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1

    if (atPageBottom) return elements[elements.length - 1]!.id

    let activeEl = elements[0]
    for (const el of elements) {
      const top = el.getBoundingClientRect().top
      if (top <= ACTIVATION_OFFSET) {
        activeEl = el
        continue
      }
      break
    }

    return activeEl.id
  }, [items])

  useEffect(() => {
    if (!items.length) return

    const updateActive = () => {
      if (pendingTargetRef.current) return
      const nextActiveId = getActiveSectionId()
      setActiveId((prev) => (prev === nextActiveId ? prev : nextActiveId))
    }

    const scheduleUpdate = () => {
      if (rafIdRef.current) return
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = 0
        updateActive()
      })
    }

    const onScrollEnd = () => {
      clearScrollLock()
      requestAnimationFrame(updateActive)
    }

    updateActive()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('scrollend', onScrollEnd)

    return () => {
      if (rafIdRef.current) window.cancelAnimationFrame(rafIdRef.current)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scrollend', onScrollEnd)
      clearScrollLock()
    }
  }, [items, getActiveSectionId, clearScrollLock])

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    clearScrollLock()
    setActiveId(id)

    if (!reducedMotion) {
      pendingTargetRef.current = id
      lockTimerRef.current = setTimeout(() => {
        lockTimerRef.current = null
        pendingTargetRef.current = null
        requestAnimationFrame(() => {
          setActiveId(getActiveSectionId())
        })
      }, SCROLL_LOCK_MS)
    }

    el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const indicatorTransition = reducedMotion
    ? { duration: 0.01 }
    : { type: 'spring' as const, stiffness: 420, damping: 36, mass: 0.85 }

  return (
    <aside className="project-page__sidebar" aria-label="Project section menu">
      {showNav && (
        <nav ref={navRef} className="project-page__menu-list" aria-label="On this page">
          <motion.div
            className="project-page__menu-indicator"
            aria-hidden
            initial={false}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: DOT_SIZE,
            }}
            animate={{ y: indicator.top, height: indicator.height }}
            transition={indicatorTransition}
          />
          {items.map((item) => {
            const isActive = item.id === activeId

            return (
              <button
                key={item.id}
                ref={(el) => setButtonRef(item.id, el)}
                type="button"
                className={cn('project-page__menu-item', isActive && 'project-page__menu-item--active')}
                onClick={() => handleNavigate(item.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="project-page__menu-dot-slot" aria-hidden />
                <span className="project-page__menu-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
      )}

      {showNav && showMeta && <div className="project-page__menu-divider" role="presentation" />}

      {showMeta && meta && (
        <div className="project-page__sidebar-meta">
          {meta.role && (
            <div className="project-page__sidebar-meta-row">
              <span className="project-page__sidebar-meta-label">Role</span>
              <span className="project-page__sidebar-meta-value">{meta.role}</span>
            </div>
          )}
          {meta.client && (
            <div className="project-page__sidebar-meta-row">
              <span className="project-page__sidebar-meta-label">Client</span>
              <span className="project-page__sidebar-meta-value">{meta.client}</span>
            </div>
          )}
          {meta.timeline && (
            <div className="project-page__sidebar-meta-row">
              <span className="project-page__sidebar-meta-label">Timeline</span>
              <span className="project-page__sidebar-meta-value">{meta.timeline}</span>
            </div>
          )}
          {meta.year != null && (
            <div className="project-page__sidebar-meta-row">
              <span className="project-page__sidebar-meta-label">Year</span>
              <span className="project-page__sidebar-meta-value">{meta.year}</span>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
