import type { Page } from '@/payload-types'
import './home-services-section.scss'

type Props = {
  heading?: Page['servicesHeading']
  intro?: Page['servicesIntro']
  services?: Page['services']
}

export function HomeServicesSection({ heading, intro, services }: Props) {
  if (!heading && !intro && (!services || services.length === 0)) return null

  const serviceCount = services?.length ?? 0
  const bentoFour = serviceCount === 4

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
            {services.map((service) => (
              <article className="home-services__card" key={service.id || service.title}>
                <h3 className="home-services__card-title">{service.title}</h3>
                {service.description && (
                  <p className="home-services__card-description">{service.description}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

