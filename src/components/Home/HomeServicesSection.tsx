'use client'

import type { Page } from '@/payload-types'
import { motion } from 'motion/react'
import { CMSIcon } from './CMSIcon'
import { KeyboardIcon } from './KeyboardIcon'
import './home-services-section.scss'

type Props = {
  heading?: Page['servicesHeading']
  intro?: Page['servicesIntro']
  services?: Page['services']
}

type ServiceBadges = NonNullable<Page['services']>[number]['badges']

const getBadgeNames = (badges?: ServiceBadges) =>
  badges?.map((badge) => badge.name).filter((name): name is string => Boolean(name)) ?? []

export function HomeServicesSection({ heading, intro, services }: Props) {
  if (!heading && !intro && (!services || services.length === 0)) return null

  const serviceCount = services?.length ?? 0
  const bentoFour = serviceCount === 3

  return (
    <section id="services" className="home-services container section">
      <div className="home-services__container">
        <div className="home-services__header">
          {heading && <h2 className="home-services__heading">{heading}</h2>}
          {intro && <p className="home-services__intro">{intro}</p>}
        </div>

        {services && services.length > 0 && (
          <div
            className={
              bentoFour
                ? 'home-services__bento home-services__bento--four'
                : 'home-services__bento home-services__bento--auto'
            }
          >
            {services.map((service) => {
              const badgeNames = getBadgeNames(service.badges)
              const hasFrontEndIcon = Boolean(service.title && /front[\s-]?end/i.test(service.title))
              const hasCMSIcon = Boolean(service.title && /cms/i.test(service.title))

              return (
                <motion.article
                  className="home-services__card"
                  key={service.id || service.title}
                  initial="rest"
                  animate="rest"
                  whileHover="hover"
                >
                  <div className="home-services__card-header">
                    <h3 className="home-services__card-title">{service.title}</h3>
                    {hasFrontEndIcon ? (
                      <span className="home-services__card-icon" aria-hidden>
                        <KeyboardIcon />
                      </span>
                    ) : hasCMSIcon ? (
                      <span className="home-services__card-icon" aria-hidden>
                        <CMSIcon />
                      </span>
                    ) : null}
                  </div>
                  {badgeNames.length > 0 ? (
                    <ul className="home-services__badge-list">
                      {badgeNames.map((badgeName) => (
                        <li className="home-services__badge" key={badgeName}>
                          {badgeName}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {service.description && (
                    <p className="home-services__card-description">{service.description}</p>
                  )}
                </motion.article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

