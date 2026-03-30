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

        return (
          <CMSLink key={i} {...link} appearance="link" onClick={onLinkClick ? () => onLinkClick() : undefined} />
        )
      })}
    </nav>
  )
}
