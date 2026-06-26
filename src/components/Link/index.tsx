import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import './index.scss'

import type { Page, Project } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | 'default' | 'outline' | 'link' | null
  children?: React.ReactNode
  className?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
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

function normalizeCustomUrl(url: string): string {
  const trimmed = url.trim()

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    /^https?:\/\//i.test(trimmed)
  ) {
    return trimmed
  }

  // URLs like www.linkedin.com/in/foo are treated as relative paths by Next.js Link.
  if (/^[\w.-]+\.[\w.-]+/.test(trimmed)) {
    return `https://${trimmed}`
  }

  return trimmed
}

function resolveHref({
  type,
  reference,
  url,
}: Pick<CMSLinkType, 'type' | 'reference' | 'url'>): string | null {
  if (type === 'reference' && typeof reference?.value === 'object' && reference.value.slug) {
    return `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${reference.value.slug}`
  }

  if (!url) {
    return null
  }

  return normalizeCustomUrl(url)
}

function isExternalHref(href: string): boolean {
  return (
    /^https?:\/\//i.test(href) ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  )
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    onClick,
    reference,
    size,
    url,
  } = props

  const href = resolveHref({ type, reference, url })

  if (!href) return null

  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}
  const external = isExternalHref(href)
  const linkClassName =
    appearance === 'inline'
      ? cn(className)
      : cn(
          'cms-link',
          `cms-link--${appearance || 'default'}`,
          size ? `cms-link--size-${size}` : null,
          className,
        )

  const content = (
    <>
      {label && label}
      {children && children}
    </>
  )

  if (external) {
    return (
      <a className={linkClassName} href={href} onClick={onClick} {...newTabProps}>
        {content}
      </a>
    )
  }

  return (
    <Link className={linkClassName} href={href} onClick={onClick} {...newTabProps}>
      {content}
    </Link>
  )
}
