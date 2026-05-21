'use client'

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

import { motion, AnimatePresence } from 'motion/react'

import './ContactPopover.scss'

type ContactPanel = NonNullable<Header['contactPanel']>
type SocialPlatform = NonNullable<NonNullable<ContactPanel['socialLinks']>[number]['platform']>

/** Strong ease-out */
const EASE_OUT = [0.23, 1, 0.32, 1] as const
const DURATION_PANEL = 0.175
const DURATION_PANEL_EXIT = 0.12
const DURATION_TOAST = 0.16
const DURATION_TRIGGER = 0.12

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

const SocialGlyph: React.FC<{ platform: SocialPlatform | string }> = ({ platform }) => {
  const size = 16
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const }

  switch (platform) {
    case 'github':
      return (
        <svg {...common}>
          <path d="M12 2C6.477 2 2 6.587 2 12.254c0 4.53 2.865 8.373 6.839 9.729.5.097.682-.222.682-.494 0-.244-.009-.892-.014-1.75-2.782.62-3.369-1.377-3.369-1.377-.455-1.186-1.11-1.502-1.11-1.502-.908-.64.069-.627.069-.627 1.004.072 1.532 1.059 1.532 1.059.892 1.566 2.341 1.114 2.91.852.091-.667.349-1.114.635-1.37-2.22-.26-4.555-1.142-4.555-5.086 0-1.124.39-2.043 1.03-2.762-.103-.262-.447-1.313.098-2.737 0 0 .84-.276 2.75 1.055A9.3 9.3 0 0 1 12 6.87c.85.004 1.705.118 2.504.347 1.909-1.331 2.748-1.055 2.748-1.055.546 1.424.202 2.475.1 2.737.64.719 1.028 1.638 1.028 2.762 0 3.954-2.339 4.823-4.566 5.078.359.318.679.944.679 1.903 0 1.374-.013 2.48-.013 2.818 0 .274.18.596.688.494C19.137 20.624 22 16.78 22 12.254 22 6.587 17.523 2 12 2Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: size,
            height: size,
            backgroundColor: 'currentColor',
            WebkitMask: "url('/icons/linkedin-icon.svg') center / contain no-repeat",
            mask: "url('/icons/linkedin-icon.svg') center / contain no-repeat",
          }}
        />
      )
    case 'x':
      return (
        <svg {...common}>
          <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.3l-4.94-7.22L5.7 22H2.6l7.3-8.35L1.2 2h6.46l4.47 6.52L18.9 2Zm-1.1 18h1.72L6.9 3.93H5.06L17.8 20Z" />
        </svg>
      )
    case 'email':
      return (
        <svg {...common}>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm2.3-.5 5.33 4.08c.22.17.52.17.74 0L17.7 6H6.3Zm11.7 2.1-4.9 3.75a2 2 0 0 1-2.42 0L5.8 8.1V17.5c0 .39.31.7.7.7h11c.39 0 .7-.31.7-.7V8.1Z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...common}>
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9A3.5 3.5 0 0 0 20 16.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.25 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...common}>
          <path d="M21.6 7.2a2.76 2.76 0 0 0-1.94-1.96C18 4.8 12 4.8 12 4.8s-6 0-7.66.44A2.76 2.76 0 0 0 2.4 7.2 28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .4 4.8 2.76 2.76 0 0 0 1.94 1.96C6 19.2 12 19.2 12 19.2s6 0 7.66-.44a2.76 2.76 0 0 0 1.94-1.96A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.4-4.8ZM10.4 15.2V8.8L15.8 12l-5.4 3.2Z" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v6h5v2h-7V7h2Z" />
        </svg>
      )
  }
}

const TOAST_MS = 2800

const PANEL_MAX_WIDTH = 309
/** Minimum space from viewport edge when fitting the panel */
const VIEWPORT_EDGE_GUTTER = 16

type DesktopPanelPlacement =
  | { kind: 'end' }
  | { kind: 'start' }
  /** Viewport couldn’t fit flush to trigger; position in px from popover root */
  | { kind: 'shift'; left: number; width: number }

function computeDesktopPanelPlacement(trigger: DOMRectReadOnly, root: DOMRectReadOnly): DesktopPanelPlacement {
  const vw = window.innerWidth
  const g = VIEWPORT_EDGE_GUTTER
  const panelW = Math.min(PANEL_MAX_WIDTH, vw - 2 * g)

  const leftEdgeIfEndAligned = trigger.right - panelW
  if (leftEdgeIfEndAligned >= g) {
    return { kind: 'end' }
  }

  const rightEdgeIfStartAligned = trigger.left + panelW
  if (rightEdgeIfStartAligned <= vw - g) {
    return { kind: 'start' }
  }

  const clampedLeftInViewport = Math.max(g, Math.min(trigger.right - panelW, vw - panelW - g))
  return {
    kind: 'shift',
    left: clampedLeftInViewport - root.left,
    width: panelW,
  }
}

export const ContactPopover: React.FC<{
  label: string
  panel: ContactPanel | null | undefined
  variant: 'desktop' | 'mobile'
  onNavigate?: () => void
  /** Matches CMSLink: `link` for nav-style underline; `default` for bordered CTA buttons */
  appearance?: 'link' | 'default'
  /** Extra classes on the trigger (e.g. home-hero__cta-link) */
  triggerClassName?: string
  /** Optional trigger content; defaults to `label` */
  children?: React.ReactNode
  size?: 'sm' | 'lg' | null
}> = ({
  label,
  panel,
  variant,
  onNavigate,
  appearance = 'link',
  triggerClassName,
  children,
  size,
}) => {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [desktopPlacement, setDesktopPlacement] = useState<DesktopPanelPlacement>({ kind: 'end' })
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduceMotion = usePrefersReducedMotion()

  const close = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current
      if (el && !el.contains(e.target as Node)) close()
    }
    const getFocusable = () => {
      const panel = document.getElementById(id)
      if (!panel) return []
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      )
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
      if (e.key === 'Tab') {
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
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close, id])

  useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() => {
      const panel = document.getElementById(id)
      const first = panel?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      )
      first?.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [open, id])

  const heading = panel?.heading?.trim()
  const subheading = panel?.subheading?.trim()
  const email = panel?.email?.trim()
  const calendarUrl = panel?.calendarUrl?.trim()
  const calendarLabel = panel?.calendarLabel?.trim() || 'Book a Call'
  const socialLinks = panel?.socialLinks ?? []

  const showCopyToast = useCallback(() => {
    setToastVisible(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastVisible(false), TOAST_MS)
  }, [])

  const copyEmail = useCallback(async () => {
    if (!email) return
    try {
      await navigator.clipboard.writeText(email)
      showCopyToast()
    } catch {
      try {
        const el = document.createElement('textarea')
        el.value = email
        el.setAttribute('readonly', 'true')
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        showCopyToast()
      } catch {
        // ignore
      }
    }
  }, [email, showCopyToast])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const measureDesktopPlacement = useCallback(() => {
    if (variant !== 'desktop') return
    const trigger = triggerRef.current
    const root = rootRef.current
    if (!trigger || !root) return
    setDesktopPlacement(computeDesktopPanelPlacement(trigger.getBoundingClientRect(), root.getBoundingClientRect()))
  }, [variant])

  useLayoutEffect(() => {
    if (!open || variant !== 'desktop') return
    measureDesktopPlacement()
    const raf = requestAnimationFrame(measureDesktopPlacement)
    window.addEventListener('resize', measureDesktopPlacement)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measureDesktopPlacement)
    }
  }, [open, variant, measureDesktopPlacement])

  const instant = { duration: 0.01 }

  const panelInitial = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }
  const panelAnimate = reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
  const panelExit = reduceMotion 
  ? { opacity: 0, transition: instant }
  : {opacity: 0,
     scale: 0.97,
     transition: {duration: DURATION_PANEL_EXIT, ease: EASE_OUT},
   }

   const panelTransition = reduceMotion ? instant : {duration: DURATION_PANEL, ease: EASE_OUT}
   const toastTransition = reduceMotion ? instant : {duration: DURATION_TOAST, ease: EASE_OUT}

  return (

    
    <div ref={rootRef} className={cn('contact-popover', variant === 'mobile' && 'contact-popover--mobile')}>
      <motion.button
        ref={triggerRef}
        aria-controls={id}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'cms-link',
          appearance === 'default' ? 'cms-link--default' : 'cms-link--link',
          'contact-popover__trigger',
          /* Nav link: strip native button chrome and match surrounding text. CTA/default: keep cms-link padding & type. */
          appearance === 'link' && 'contact-popover__trigger--inherit',
          size === 'lg' && 'cms-link--size-lg',
          size === 'sm' && 'cms-link--size-sm',
          triggerClassName,
        )}
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: DURATION_TRIGGER, ease: EASE_OUT }}
      >
        {children ?? label}
      </motion.button>

      
      <AnimatePresence>
      {open ? (
        
        <motion.div
          key="contact-panel"
          className={cn(
            'contact-popover__panel',
            variant === 'desktop' &&
              desktopPlacement.kind === 'end' &&
              'contact-popover__panel--desktop-end',
            variant === 'desktop' &&
              desktopPlacement.kind === 'start' &&
              'contact-popover__panel--desktop-start',
            variant === 'desktop' &&
              desktopPlacement.kind === 'shift' &&
              'contact-popover__panel--desktop-shift',
          )}
          id={id}
          role="dialog"
          aria-label={heading || `${label} options`}
          onMouseDown={(e) => e.stopPropagation()}
          initial={panelInitial}
          animate={panelAnimate}
          exit={panelExit}
          transition={panelTransition}
          style={
            variant === 'desktop' && desktopPlacement.kind === 'shift'
              ? {
                  left: desktopPlacement.left,
                  width: desktopPlacement.width,
                  right: 'auto',
                  transformOrigin: 'top left',
                }
              : undefined
          }
        >
          {heading ? <p className="contact-popover__heading">{heading}</p> : null}

          {email ? (
            <div className="contact-popover__row contact-popover__email-row">
              <button
                type="button"
                className="contact-popover__copy"
                onClick={() => copyEmail()}
                aria-label="Copy email"
              >
                <span className="contact-popover__copy-icon" aria-hidden />
              </button>
              <a className="contact-popover__email" href={`mailto:${email}`} onClick={onNavigate}>
                {email}
              </a>
              
            </div>
          ) : null}

          {calendarUrl ? (
            <a
              className="contact-popover__cta"
              href={calendarUrl}
              onClick={onNavigate}
              rel="noopener noreferrer"
              target="_blank"
            >
              {calendarLabel}
            </a>
          ) : null}

          {socialLinks.length > 0 ? (
            <div className="contact-popover__socials">
              {socialLinks.map((row, i) => {
                const platform = row.platform ?? 'website'
                const linkProps = row.link as React.ComponentProps<typeof CMSLink>
                return (
                  <CMSLink
                    key={i}
                    {...linkProps}
                    appearance="inline"
                    className="contact-popover__social-hit"
                    onClick={() => onNavigate?.()}
                  >
                    <span className="contact-popover__sr-only">{platform}</span>
                    <span aria-hidden className="contact-popover__social-tile">
                      <SocialGlyph platform={platform} />
                    </span>
                  </CMSLink>
                )
              })}
            </div>
          ) : null}

          {subheading ? <p className="contact-popover__subheading">{subheading}</p> : null}
        </motion.div>
      ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toastVisible ? (
          <motion.div
            key="copy-toast"
            className="contact-popover__toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={toastTransition}
          >
            Copied to clipboard
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
