'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import type { Header, Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ContactPopover } from '@/Header/ContactPopover'
import { ArrowRight } from 'lucide-react'

import { HeroInteractive, type HeroMode } from './HeroInteractive'
import './home-hero-section.scss'

/** Set false to keep particles in idle on touch devices if tap interaction feels off. */
const ENABLE_MOBILE_TAP = true

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

export const HomeHeroSection: React.FC<
  Page['hero'] & { contactPanel?: Header['contactPanel'] | null }
> = ({ heading, location, position, subheading, cta, contactPanel }) => {
  if (!heading) return null

  const ctaMode = cta?.mode ?? 'link'
  const ctaLink = cta?.link
  const contactLabel = cta?.contactLabel?.trim()
  const showContactCta = ctaMode === 'contact' && Boolean(contactLabel)
  const showLinkCta =
    ctaMode === 'link' && Boolean(ctaLink?.label?.trim()) && hasCtaDestination(ctaLink)
  const showCta = showContactCta || showLinkCta

  const [hoverDeveloper, setHoverDeveloper] = useState(false)
  const [hoverDesigner, setHoverDesigner] = useState(false)
  const [tapMode, setTapMode] = useState<HeroMode | null>(null)
  const [coarsePointer, setCoarsePointer] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mqCoarse = window.matchMedia('(pointer: coarse)')
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    const applyCoarse = () => setCoarsePointer(mqCoarse.matches)
    const applyReduce = () => setReducedMotion(mqReduce.matches)

    applyCoarse()
    applyReduce()
    mqCoarse.addEventListener('change', applyCoarse)
    mqReduce.addEventListener('change', applyReduce)
    return () => {
      mqCoarse.removeEventListener('change', applyCoarse)
      mqReduce.removeEventListener('change', applyReduce)
    }
  }, [])

  const useTap = ENABLE_MOBILE_TAP && coarsePointer

  const visualMode: HeroMode = useMemo(() => {
    if (reducedMotion) return 'idle'
    if (useTap) {
      return tapMode ?? 'idle'
    }
    if (hoverDesigner) return 'designer'
    if (hoverDeveloper) return 'developer'
    return 'idle'
  }, [reducedMotion, useTap, tapMode, hoverDesigner, hoverDeveloper])

  const toggleTapMode = useCallback((next: 'developer' | 'designer') => {
    setTapMode((prev) => (prev === next ? null : next))
  }, [])

  return (
    <section className="home-hero container section">
      <div className="home-hero__inner">
        <div className="home-hero__lead">
          <h1 className="home-hero__heading">{heading}</h1>
          {position && <p className="home-hero__position">{position}</p>}
        </div>

        <HeroInteractive mode={visualMode} reducedMotion={reducedMotion} className="home-hero__interactive" />

        <div className="home-hero__body">
          <h2 className="home-hero__heading-2">
            Creative{' '}
            <span
              className={`home-hero__hover-text${visualMode === 'developer' ? ' home-hero__hover-text--active' : ''}`}
              onMouseEnter={() => setHoverDeveloper(true)}
              onMouseLeave={() => setHoverDeveloper(false)}
              onClick={() => useTap && toggleTapMode('developer')}
              aria-label={useTap ? 'Toggle particle view: Developer grid' : undefined}
              role={useTap ? 'button' : undefined}
              tabIndex={useTap ? 0 : undefined}
              onKeyDown={(e) => {
                if (!useTap) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleTapMode('developer')
                }
              }}
            >
              Developer
            </span>{' '}
            and{' '}
            <span
              className={`home-hero__hover-text${visualMode === 'designer' ? ' home-hero__hover-text--active' : ''}`}
              onMouseEnter={() => setHoverDesigner(true)}
              onMouseLeave={() => setHoverDesigner(false)}
              onClick={() => useTap && toggleTapMode('designer')}
              aria-label={useTap ? 'Toggle particle view: Designer motion' : undefined}
              role={useTap ? 'button' : undefined}
              tabIndex={useTap ? 0 : undefined}
              onKeyDown={(e) => {
                if (!useTap) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleTapMode('designer')
                }
              }}
            >
              Designer
            </span>
          </h2>
          {subheading && <p className="home-hero__subheading">{subheading}</p>}
          {location ? (
            <div className="home-hero__location-row">
              <span className="home-hero__location-glow" aria-hidden />
              <p className="home-hero__location">{location}</p>
            </div>
          ) : null}
          {showCta ? (
            <div className="home-hero__cta">
              {showContactCta && contactLabel ? (
                <ContactPopover
                  appearance="default"
                  label={contactLabel}
                  panel={contactPanel}
                  triggerClassName="cta-link"
                  variant="desktop"
                >
                  <span>{contactLabel}</span>
                  <span className="cta-link__icon-wrap" aria-hidden>
                    <ArrowRight className="cta-link__icon" size={24} strokeWidth={2} />
                  </span>
                </ContactPopover>
              ) : ctaLink ? (
                <CMSLink
                  {...ctaLink}
                  label={undefined}
                  appearance="default"
                  className="cta-link"
                >
                  <span>{ctaLink.label}</span>
                  <span className="cta-link__icon-wrap" aria-hidden>
                    <ArrowRight className="cta-link__icon" size={24} strokeWidth={2} />
                  </span>
                </CMSLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
