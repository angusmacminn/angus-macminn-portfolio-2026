'use client'

import type { Page, Project } from '@/payload-types'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

import { Media } from '@/components/Media'
import './home-works-section.scss'

type Props = {
  heading?: Page['worksHeading']
  intro?: Page['worksIntro']
  projects: Project[]
}

/** Matches Paper work-card arrow: 42px circle, 18px icon (desktop – home dark). */
function CardArrowIcon() {
  return (
    <span className="home-works__card-arrow" aria-hidden>
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.523 18.787s4.501-4.505 6.255-6.26a.75.75 0 0 0 0-1.06c-1.753-1.754-6.255-6.258-6.255-6.258a.75.75 0 0 0-1.06 1.06l4.978 4.978H3.75a.75.75 0 0 0 0 1.5h14.692l-4.979 4.979a.75.75 0 0 0 1.06 1.06z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

function CardTags({
  projectId,
  tags,
  variant,
}: {
  projectId: string | number
  tags: NonNullable<Project['cardTags']>
  variant: 'overlay' | 'inline'
}) {
  return (
    <ul
      className={
        variant === 'overlay'
          ? 'home-works__card-tags home-works__card-tags--overlay'
          : 'home-works__card-tags home-works__card-tags--inline'
      }
    >
      {tags.map((item, index) => (
        <li key={item.id ?? `${projectId}-tag-${index}`}>{item.tag}</li>
      ))}
    </ul>
  )
}

export function HomeWorksSection({ heading, intro, projects }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start' })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return

    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (!heading && !intro && projects.length === 0) return null

  return (
    <section id="work" className="home-works container section">
      {heading && <h2 className="home-works__heading">{heading}</h2>}
      {intro && <p className="home-works__intro">{intro}</p>}

      <div className="home-works__carousel">
        <div className="home-works__viewport" ref={emblaRef}>
          <div className="home-works__container">
            {projects.map((project) => {
              const slug = project.slug
              const description = project.cardDescription ?? project.subtitle
              const thumbnail =
                typeof project.cardThumbnail === 'object' && project.cardThumbnail != null
                  ? project.cardThumbnail
                  : null
              const tags = project.cardTags?.length ? project.cardTags : null

              const cardBody = (
                <>
                  <div className="home-works__card-header">
                    <h3 className="home-works__card-title">{project.title}</h3>
                    <CardArrowIcon />
                  </div>

                  {thumbnail ? (
                    <div className="home-works__card-image">
                      <Media
                        htmlElement={null}
                        resource={thumbnail}
                        pictureClassName="home-works__card-picture"
                        imgClassName="home-works__card-img"
                        videoClassName="home-works__card-img"
                        size="(max-width: 768px) 100vw, 50vw"
                      />
                      {tags && <CardTags projectId={project.id} tags={tags} variant="overlay" />}
                    </div>
                  ) : (
                    tags && <CardTags projectId={project.id} tags={tags} variant="inline" />
                  )}

                  <div className="home-works__card-content">
                    {description && <p className="home-works__card-subtitle">{description}</p>}
                    
                  </div>
                </>
              )

              return (
                <article className="home-works__slide home-works__card" key={project.id}>
                  {slug ? (
                    <Link className="home-works__card-link" href={`/projects/${slug}`}>
                      {cardBody}
                    </Link>
                  ) : (
                    <div className="home-works__card-link home-works__card-link--static">{cardBody}</div>
                  )}
                </article>
              )
            })}
          </div>
        </div>

        {projects.length > 1 && (
          <div className="home-works__controls" aria-label="Work carousel controls">
            <button
              type="button"
              className="home-works__control"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous project"
            >
              Prev
            </button>
            <button
              type="button"
              className="home-works__control"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next project"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
