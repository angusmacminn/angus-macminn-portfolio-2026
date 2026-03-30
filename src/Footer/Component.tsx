import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import './component.scss'

type PageLinkColumn = {
  heading?: string | null
  links?: Array<{ link: React.ComponentProps<typeof CMSLink> }> | null
}

type SocialLink = {
  platform?: 'github' | 'linkedin' | 'x' | 'email' | 'instagram' | 'youtube' | 'website' | string | null
  link?: React.ComponentProps<typeof CMSLink> | null
}

const SocialIcon: React.FC<{ platform: NonNullable<SocialLink['platform']> }> = ({ platform }) => {
  // Simple, consistent 20px icon set; color via currentColor.
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
        <svg {...common}>
          <path
            d="M6.94 6.5A2.44 2.44 0 1 1 6.94 1.62a2.44 2.44 0 0 1 0 4.88ZM2.9 22.4h8.08V7.9H2.9v14.5ZM13.33 7.9h7.75v1.98h.11c1.08-1.98 2.94-2.29 4.32-2.29 4.62 0 5.48 3.05 5.48 7.01V22.4h-8.08v-6.7c0-1.6-.03-3.66-2.23-3.66-2.23 0-2.57 1.74-2.57 3.54v6.82h-8.08V7.9h3.3Z"
            fill="currentColor"
          />
        </svg>
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

export async function Footer() {
  const footerData = (await getCachedGlobal('footer', 1)()) as Footer & {
    pageLinks?: PageLinkColumn[] | null
    socialLinks?: SocialLink[] | null
  }

  const pageLinks = footerData?.pageLinks || []
  const socialLinks = footerData?.socialLinks || []
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__container container">
        <div className="site-footer__top">
        <div className="site-footer__divider" role="presentation" />
          <div className="site-footer__columns" aria-label="Footer links">
            {pageLinks.map((col, i) => {
              const heading = col?.heading ?? ''
              const links = col?.links ?? []
              return (
                <nav className="site-footer__column" key={i} aria-label={heading || `Footer column ${i + 1}`}>
                  {heading ? <div className="site-footer__column-heading">{heading}</div> : null}
                  <ul className="site-footer__column-links">
                    {links.map(({ link }, j) => (
                      <li className="site-footer__column-link" key={`${i}-${j}`}>
                        <CMSLink className="site-footer__link" {...(link as any)} />
                      </li>
                    ))}
                  </ul>
                </nav>
              )
            })}
          </div>

          <div className="site-footer__social">
            <div className="site-footer__label">Socials</div>
            <div className="site-footer__social-links" aria-label="Social links">
              {socialLinks.map((item, i) => {
                const platform = item?.platform || 'website'
                const linkProps = (item as any)?.link || {}
                return (
                  <CMSLink
                    aria-label={typeof platform === 'string' ? platform : 'Social link'}
                    className="site-footer__social-link"
                    key={i}
                    {...linkProps}
                  >
                    <SocialIcon platform={platform as any} />
                  </CMSLink>
                )
              })}
            </div>
          </div>
        </div>

        

        <div className="site-footer__bottom">
          <p className="site-footer__copyright">© {year} AM. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  )
}
