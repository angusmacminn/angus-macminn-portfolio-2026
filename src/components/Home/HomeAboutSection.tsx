import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import './home-about-section.scss'

type Props = {
  heading?: Page['aboutHeading']
  body?: Page['aboutBody']
  image?: Page['aboutImage']
}

export function HomeAboutSection({ heading, body, image }: Props) {
  if (!heading && !body && !image) return null

  return (
    <section className="home-about container">
      {heading && <h2 className="home-about__heading">{heading}</h2>}

      <div className="home-about__grid">
        {body && (
          <div className="home-about__body">
            <RichText data={body} />
          </div>
        )}

        {image && typeof image === 'object' && (
          <div className="home-about__image">
            <Media resource={image} />
          </div>
        )}
      </div>
    </section>
  )
}

