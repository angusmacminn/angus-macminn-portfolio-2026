import React from 'react'

import type { Page } from '@/payload-types'
import './home-hero-section.scss'

export const HomeHeroSection: React.FC<Page['hero']> = ({ heading, location, position, subheading }) => {
  if (!heading) return null

  return (
    <section className="home-hero container">
      <div className="home-hero__content">
        <h1 className="home-hero__heading">{heading}</h1>
        {position && <p className="home-hero__position">{position}</p>}
        <h2 className="home-hero__heading-2">Creative Developer and Designer</h2>
        {subheading && <p className="home-hero__subheading">{subheading}</p>}
        {location && <p className="home-hero__location">{location}</p>}
      </div>
    </section>
  )
}
