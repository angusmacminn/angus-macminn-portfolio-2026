import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ArrowRight } from 'lucide-react'

import './home-hero-section.scss'

function hasCtaDestination(
  link:
    | {
        type?: ('reference' | 'custom') | null
        url?: string | null
        reference?: unknown
      }
    | null
    | undefined,
): boolean {
  if (!link) return false
  if (link.type === 'custom') return Boolean(link.url?.trim())
  if (link.type === 'reference') return Boolean(link.reference)
  return Boolean(link.url?.trim() || link.reference)
}

export const HomeHeroSection: React.FC<Page['hero']> = ({
  heading,
  location,
  position,
  subheading,
  cta,
}) => {
  if (!heading) return null

  const ctaLink = cta?.link
  const showCta = ctaLink?.label?.trim() && hasCtaDestination(ctaLink)

  return (
    <section className="home-hero container section">
      <div className="home-hero__content">
        <h1 className="home-hero__heading">{heading}</h1>
        {position && <p className="home-hero__position">{position}</p>}
        <h2 className="home-hero__heading-2">Creative Developer and Designer</h2>
        {subheading && <p className="home-hero__subheading">{subheading}</p>}
        {location && <p className="home-hero__location">{location}</p>}
        {showCta && ctaLink ? (
          <div className="home-hero__cta">
            <CMSLink
              {...ctaLink}
              // Render label via children so we can control layout and icon without double text
              label={undefined}
              appearance="default"
              className="home-hero__cta-link"
            >
              <span>{ctaLink.label}</span>
              <ArrowRight aria-hidden className="home-hero__cta-icon" size={18} strokeWidth={2} />
            </CMSLink>
          </div>
        ) : null}
      </div>
    </section>
  )
}
