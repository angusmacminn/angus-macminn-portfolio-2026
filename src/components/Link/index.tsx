import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import './index.scss'

import type { Page, Project } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | 'default' | 'outline' | 'link' | null
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'projects'
    value: Page | Project | string | number
  } | null
  size?: 'clear' | 'default' | 'sm' | 'lg' | 'icon' | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Link
      className={cn(
        'cms-link',
        `cms-link--${appearance || 'default'}`,
        size ? `cms-link--size-${size}` : null,
        className,
      )}
      href={href || url || ''}
      {...newTabProps}
    >
      {label && label}
      {children && children}
    </Link>
  )
}
