'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { ContactPopover } from '@/Header/ContactPopover'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import './index.scss'

export const HeaderNav: React.FC<{
  data: HeaderType
  variant?: 'desktop' | 'mobile'
  onLinkClick?: () => void
}> = ({ data, variant = 'desktop', onLinkClick }) => {
  const navItems = data?.navItems || []
  const contactPanel = data?.contactPanel

  const getHomeSectionHref = (rawUrl?: string | null) => {
    if (!rawUrl) return null

    const normalized = rawUrl.trim().toLowerCase()
    if (normalized === '/about' || normalized === 'about' || normalized === '#about') return '/#about'
    if (normalized === '/work' || normalized === 'work' || normalized === '#work') return '/#work'

    return null
  }

  return (
    <nav
      aria-label="Main"
      className={cn('header-nav', variant === 'desktop' ? 'header-nav--desktop' : 'header-nav--mobile')}
    >
      {navItems.map((item, i) => {
        const { link, itemType } = item
        const label = link?.label?.trim() || 'Contact'

        if (itemType === 'contact') {
          return (
            <ContactPopover
              key={i}
              label={label}
              panel={contactPanel}
              variant={variant}
              onNavigate={onLinkClick}
            />
          )
        }

        const sectionHref = getHomeSectionHref(link?.url)

        return (
          <CMSLink
            key={i}
            {...link}
            type={sectionHref ? 'custom' : link?.type}
            url={sectionHref ?? link?.url}
            appearance="link"
            onClick={onLinkClick ? () => onLinkClick() : undefined}
          />
        )
      })}
    </nav>
  )
}
