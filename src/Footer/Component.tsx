import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import './component.scss'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="site-footer">
      <div className="site-footer__container container">
        <Link className="site-footer__brand" href="/">
          <Logo />
        </Link>

        <div className="site-footer__controls">
          <ThemeSelector />
          <nav className="site-footer__nav">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="site-footer__nav-link" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
