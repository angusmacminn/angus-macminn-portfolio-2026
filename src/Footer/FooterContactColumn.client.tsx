'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import type { Header } from '@/payload-types'
import { CMSLink } from '@/components/Link'

type ContactPanel = NonNullable<Header['contactPanel']>
type SocialLink = NonNullable<ContactPanel['socialLinks']>[number]

const TOAST_MS = 2800
const TOAST_DURATION = 0.16
const ICON_DURATION = 0.14
const EASE_OUT = [0.23, 1, 0.32, 1] as const

const SocialIcon: React.FC<{ platform: NonNullable<SocialLink['platform']> }> = ({ platform }) => {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
    focusable: false as any,
  }

  switch (platform) {
    case 'github':
      return (
        <svg {...common}>
          <path
            d="M12 2C6.477 2 2 6.587 2 12.254c0 4.53 2.865 8.373 6.839 9.729.5.097.682-.222.682-.494 0-.244-.009-.892-.014-1.75-2.782.62-3.369-1.377-3.369-1.377-.455-1.186-1.11-1.502-1.11-1.502-.908-.64.069-.627.069-.627 1.004.072 1.532 1.059 1.532 1.059.892 1.566 2.341 1.114 2.91.852.091-.667.349-1.114.635-1.37-2.22-.26-4.555-1.142-4.555-5.086 0-1.124.39-2.043 1.03-2.762-.103-.262-.447-1.313.098-2.737 0 0 .84-.276 2.75 1.055A9.3 9.3 0 0 1 12 6.87c.85.004 1.705.118 2.504.347 1.909-1.331 2.748-1.055 2.748-1.055.546 1.424.202 2.475.1 2.737.64.719 1.028 1.638 1.028 2.762 0 3.954-2.339 4.823-4.566 5.078.359.318.679.944.679 1.903 0 1.374-.013 2.48-.013 2.818 0 .274.18.596.688.494C19.137 20.624 22 16.78 22 12.254 22 6.587 17.523 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'linkedin':
      return (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 20,
            height: 20,
            backgroundColor: 'currentColor',
            WebkitMask: "url('/icons/linkedin-icon.svg') center / contain no-repeat",
            mask: "url('/icons/linkedin-icon.svg') center / contain no-repeat",
          }}
        />
      )
    case 'x':
      return (
        <svg {...common}>
          <path
            d="M18.9 2H22l-6.77 7.74L23.2 22h-6.3l-4.94-7.22L5.7 22H2.6l7.3-8.35L1.2 2h6.46l4.47 6.52L18.9 2Zm-1.1 18h1.72L6.9 3.93H5.06L17.8 20Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'email':
      return (
        <svg {...common}>
          <path
            d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm2.3-.5 5.33 4.08c.22.17.52.17.74 0L17.7 6H6.3Zm11.7 2.1-4.9 3.75a2 2 0 0 1-2.42 0L5.8 8.1V17.5c0 .39.31.7.7.7h11c.39 0 .7-.31.7-.7V8.1Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...common}>
          <path
            d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9A3.5 3.5 0 0 0 20 16.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.25 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...common}>
          <path
            d="M21.6 7.2a2.76 2.76 0 0 0-1.94-1.96C18 4.8 12 4.8 12 4.8s-6 0-7.66.44A2.76 2.76 0 0 0 2.4 7.2 28.7 28.7 0 0 0 2 12a28.7 28.7 0 0 0 .4 4.8 2.76 2.76 0 0 0 1.94 1.96C6 19.2 12 19.2 12 19.2s6 0 7.66-.44a2.76 2.76 0 0 0 1.94-1.96A28.7 28.7 0 0 0 22 12a28.7 28.7 0 0 0-.4-4.8ZM10.4 15.2V8.8L15.8 12l-5.4 3.2Z"
            fill="currentColor"
          />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v6h5v2h-7V7h2Z" fill="currentColor" />
        </svg>
      )
  }
}

export function FooterContactColumn({
  heading,
  email,
  calendarLabel,
  calendarUrl,
  socialLinks,
}: {
  heading?: string | null
  email?: string | null
  calendarLabel?: string | null
  calendarUrl?: string | null
  socialLinks?: SocialLink[] | null
}) {
  const [copied, setCopied] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyEmail = useCallback(async () => {
    if (!email) return

    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setCopied(false), TOAST_MS)
    } catch {
      // Ignore clipboard failures silently.
    }
  }, [email])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  return (
    <section className="site-footer__column site-footer__column--contact" aria-label="Contact">
      <div className="site-footer__column-heading">{heading || 'Contact'}</div>

      {email ? (
        <div className="site-footer__contact-row">

<button
            type="button"
            className="site-footer__copy"
            onClick={copyEmail}
            aria-label="Copy email address"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  className="site-footer__check-icon"
                  aria-hidden
                  initial={{ opacity: 0, transform: 'scale(0.92)' }}
                  animate={{ opacity: 1, transform: 'scale(1)' }}
                  exit={{ opacity: 0, transform: 'scale(0.92)' }}
                  transition={{ duration: ICON_DURATION, ease: EASE_OUT }}
                />
              ) : (
                <motion.span
                  key="copy"
                  className="site-footer__copy-icon"
                  aria-hidden
                  initial={{ opacity: 0, transform: 'scale(0.92)' }}
                  animate={{ opacity: 1, transform: 'scale(1)' }}
                  exit={{ opacity: 0, transform: 'scale(0.92)' }}
                  transition={{ duration: ICON_DURATION, ease: EASE_OUT }}
                />
              )}
            </AnimatePresence>
          </button>
          <a className="site-footer__contact-email" href={`mailto:${email}`}>
            {email}
          </a>
          
        </div>
      ) : null}

      {calendarUrl ? (
        <LinkLike href={calendarUrl} label={calendarLabel?.trim() || 'Book a Call'} />
      ) : null}

      {socialLinks && socialLinks.length > 0 ? (
        <div className="site-footer__contact-social">
          <div className="site-footer__label">Socials</div>
          <nav className="site-footer__social-links" aria-label="Contact social links">
            {socialLinks.map((item, i) => {
              const platform = item?.platform || 'website'
              const linkProps = item?.link || {}
              return (
                <CMSLink
                  aria-label={typeof platform === 'string' ? platform : 'Social link'}
                  className="site-footer__social-link"
                  key={item.id || i}
                  {...(linkProps as any)}
                >
                  <SocialIcon platform={platform as any} />
                </CMSLink>
              )
            })}
          </nav>
        </div>
      ) : null}

      <AnimatePresence>
        {copied ? (
          <motion.div
            key="copy-toast"
            className="site-footer__toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: TOAST_DURATION, ease: [0.23, 1, 0.32, 1] }}
          >
            Copied to clipboard
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function LinkLike({ href, label }: { href: string; label: string }) {
  return (
    <a className="site-footer__book-call" href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}
