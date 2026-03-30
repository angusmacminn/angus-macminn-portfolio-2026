import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import './home-about-section.scss'

type Props = {
  heading?: Page['aboutHeading']
  body?: Page['aboutBody']
  image?: Page['aboutImage']
  toolsHeading?: Page['toolsHeading']
  toolsSubheadingOne?: Page['toolsSubheadingOne']
  toolsSubheadingTwo?: Page['toolsSubheadingTwo']
  toolsSubheadingThree?: Page['toolsSubheadingThree']
  toolsColumnOne?: Page['toolsColumnOne']
  toolsColumnTwo?: Page['toolsColumnTwo']
  toolsColumnThree?: Page['toolsColumnThree']
}

export function HomeAboutSection({
  heading,
  body,
  image,
  toolsHeading,
  toolsSubheadingOne,
  toolsSubheadingTwo,
  toolsSubheadingThree,
  toolsColumnOne,
  toolsColumnTwo,
  toolsColumnThree,
}: Props) {
  const showTools =
    Boolean(toolsHeading || toolsSubheadingOne || toolsSubheadingTwo || toolsSubheadingThree) ||
    Boolean(toolsColumnOne?.length || toolsColumnTwo?.length || toolsColumnThree?.length)

  if (!heading && !body && !image && !showTools) return null

  return (
    <section id="about" className="home-about container section">
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

      {showTools && (
        <div className="home-about__tools">
          {toolsHeading && <h3 className="home-about__tools-heading">{toolsHeading}</h3>}

          <div className="home-about__tools-grid">
            <div className="home-about__tools-column home-about__tools-column--double">
              {toolsSubheadingOne && <h4 className="home-about__tools-subheading">{toolsSubheadingOne}</h4>}
              {toolsColumnOne?.length ? (
                <ul className="home-about__tools-list home-about__tools-list--double">
                  {toolsColumnOne.map((item, index) => (
                    <li key={item.id ?? `tools-col-one-${index}`}>{item.name}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="home-about__tools-column">
              {toolsSubheadingTwo && <h4 className="home-about__tools-subheading">{toolsSubheadingTwo}</h4>}
              {toolsColumnTwo?.length ? (
                <ul className="home-about__tools-list">
                  {toolsColumnTwo.map((item, index) => (
                    <li key={item.id ?? `tools-col-two-${index}`}>{item.name}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="home-about__tools-column">
              {toolsSubheadingThree && <h4 className="home-about__tools-subheading">{toolsSubheadingThree}</h4>}
              {toolsColumnThree?.length ? (
                <ul className="home-about__tools-list">
                  {toolsColumnThree.map((item, index) => (
                    <li key={item.id ?? `tools-col-three-${index}`}>{item.name}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

