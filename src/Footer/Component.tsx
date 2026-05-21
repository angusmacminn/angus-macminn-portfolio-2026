import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Footer, Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { FooterContactColumn } from './FooterContactColumn.client'
import { isComingSoon } from '@/utilities/comingSoon'
import './component.scss'

type PageLinkColumn = {
  heading?: string | null
  links?: Array<{ link: React.ComponentProps<typeof CMSLink> }> | null
}

const getHomeSectionHref = (rawUrl?: string | null): string | null => {
  if (!rawUrl) return null
  const normalized = rawUrl.trim().toLowerCase()
  if (normalized === '/about' || normalized === 'about' || normalized === '#about') return '/#about'
  if (normalized === '/work' || normalized === 'work' || normalized === '#work') return '/#work'
  return null
}

export async function Footer() {
  const footerData = (await getCachedGlobal('footer', 1)()) as Footer & {
    pageLinks?: PageLinkColumn[] | null
  }
  const headerData = (await getCachedGlobal('header', 1)()) as Header
  const contactPanel = headerData?.contactPanel

  const pageLinks = footerData?.pageLinks || []
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
                    {links.map(({ link }, j) => {
                      const l = link as any
                      if (isComingSoon(l?.url, l?.reference)) {
                        return (
                          <li className="site-footer__column-link" key={`${i}-${j}`}>
                            <span className="site-footer__coming-soon">
                              <span className="site-footer__coming-soon-label">{l?.label}</span>
                              <span className="site-footer__coming-soon-tag" aria-hidden="true">
                                coming soon
                              </span>
                            </span>
                          </li>
                        )
                      }
                      const sectionHref = getHomeSectionHref(l?.url)
                      return (
                        <li className="site-footer__column-link" key={`${i}-${j}`}>
                          <CMSLink
                            appearance="link"
                            className="site-footer__link"
                            {...l}
                            type={sectionHref ? 'custom' : l?.type}
                            url={sectionHref ?? l?.url}
                          />
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              )
            })}

            <FooterContactColumn
              heading={contactPanel?.heading}
              email={contactPanel?.email}
              calendarLabel={contactPanel?.calendarLabel}
              calendarUrl={contactPanel?.calendarUrl}
              socialLinks={contactPanel?.socialLinks}
            />
          </div>
        </div>

        

        <div className="site-footer__bottom">
          <p className="site-footer__copyright">© {year} AM. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  )
}
