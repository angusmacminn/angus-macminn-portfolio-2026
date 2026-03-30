'use client'

import React, { useEffect, useState } from 'react'

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
  const showMeta = hasMeta(meta)
  const showNav = items.length > 0

  useEffect(() => {
    if (!items.length) return

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!elements.length) return

    const activationOffset = 112
    let rafId = 0

    const getActiveSectionId = () => {
      const atPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2

      if (atPageBottom) return elements[elements.length - 1]!.id

      // Use the last section that has crossed a fixed line in the viewport.
      // This avoids neighboring sections rapidly swapping active state.
      let activeEl = elements[0]

      for (const el of elements) {
        const top = el.getBoundingClientRect().top
        if (top <= activationOffset) {
          activeEl = el
          continue
        }
        break
      }

      return activeEl.id
    }

    const updateActive = () => {
      const nextActiveId = getActiveSectionId()
      setActiveId((prevActiveId) => (prevActiveId === nextActiveId ? prevActiveId : nextActiveId))
    }

    const scheduleUpdate = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        updateActive()
      })
    }

    updateActive()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [items])

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
  }

  return (
    <aside className="project-page__sidebar" aria-label="Project section menu">
      {showNav && (
        <nav className="project-page__menu-list">
          {items.map((item) => {
            const isActive = item.id === activeId

            return (
              <button
                key={item.id}
                type="button"
                className={
                  isActive ? 'project-page__menu-item project-page__menu-item--active' : 'project-page__menu-item'
                }
                onClick={() => handleNavigate(item.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="project-page__menu-dot" aria-hidden />
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
