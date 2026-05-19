import type { Metadata } from 'next'

import { CMSLink } from '@/components/Link'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Media as MediaType } from '@/payload-types'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import './page.scss'
import { ProjectKickerSidebar } from './ProjectKickerSidebar.client'

type Args = {
  params: Promise<{
    slug: string
  }>
}

type LegacySectionMediaItem = {
  id?: string | null
  image?: MediaType | string | number | null
  caption?: string | null
}

type SectionMediaItem = {
  id?: string | null
  media?: MediaType | string | number | null
  caption?: string | null
  autoplay?: boolean | null
  loop?: boolean | null
  muted?: boolean | null
  controls?: boolean | null
  playsInline?: boolean | null
}

type ProjectWithLegacyHero = RequiredDataFromCollectionSlug<'projects'> & {
  heroImage?: MediaType | string | number | null
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const projects = await payload.find({
      collection: 'projects',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    return projects.docs.map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug(decodedSlug)

  if (!project) {
    return <PayloadRedirects url={`/projects/${decodedSlug}`} />
  }

  const projectWithLegacyHero = project as ProjectWithLegacyHero
  const heroMedia = project.heroMedia ?? projectWithLegacyHero.heroImage

  const sections = project.sections ?? []
  const menuItems =
    sections?.map((section, index) => {
      const id = `project-section-${index}`
      const label = section.kicker || section.heading || `Section ${index + 1}`

      return {
        id,
        label,
      }
    }) ?? []

  const sidebarMeta = {
    role: project.role,
    client: project.client,
    timeline: project.timeline,
    year: project.year,
  }

  const showSidebar =
    menuItems.length > 0 ||
    Boolean(project.role || project.client || project.timeline || project.year != null)

  return (
    <article className="project-page container">
      <div
        className={
          showSidebar ? 'project-page__layout' : 'project-page__layout project-page__layout--single'
        }
      >
        {showSidebar && <ProjectKickerSidebar items={menuItems} meta={sidebarMeta} showBackLink />}

        <div className="project-page__content">
          <header className="project-page__header">
            <Link
              href="/#work"
              className={
                showSidebar
                  ? 'project-page__back-link project-page__back-link--header project-page__back-link--mobile-only'
                  : 'project-page__back-link project-page__back-link--header'
              }
            >
              Back to works
            </Link>
            <h1 className="project-page__title">{project.title}</h1>
            {project.subtitle && <p className="project-page__subtitle">{project.subtitle}</p>}

            <div className="project-page__meta">
              {project.projectURL && (
                <CMSLink
                  appearance="default"
                  className="home-hero__cta-link project-page__visit-site-link"
                  newTab
                  type="custom"
                  url={project.projectURL}
                >
                  <span>Visit Site</span>
                </CMSLink>
              )}
            </div>
          </header>

          {typeof heroMedia === 'object' && heroMedia && (
            <section className="project-page__hero-image">
              <Media
                className="project-page__hero-media"
                pictureClassName="project-page__media-picture"
                imgClassName="project-page__media-image"
                videoClassName="project-page__media-video"
                resource={heroMedia}
              />
              {project.heroCaption && <p className="project-page__hero-caption">{project.heroCaption}</p>}
            </section>
          )}

          {project.overview && (
            <section className="project-page__overview">
              <p>{project.overview}</p>
            </section>
          )}

          {project.story && (
            <section className="project-page__story">
              <RichText data={project.story} />
            </section>
          )}

          {sections.length > 0 && (
            <section className="project-page__sections">
              {sections.map((section, index) => {
                const id = `project-section-${index}`
                const legacySection = section as typeof section & {
                  images?: LegacySectionMediaItem[] | null
                }
                const mediaItems: SectionMediaItem[] =
                  (section.mediaItems as SectionMediaItem[] | null | undefined) ??
                  legacySection.images?.map((item): SectionMediaItem => ({
                    id: item.id,
                    media: item.image,
                    caption: item.caption,
                    autoplay: true,
                    loop: true,
                    muted: true,
                    controls: false,
                    playsInline: true,
                  })) ??
                  []

                return (
                  <article className="project-page__section" key={section.id || section.heading} id={id}>
                    {section.kicker && <p className="project-page__section-kicker">{section.kicker}</p>}
                    <h2 className="project-page__section-heading">{section.heading}</h2>
                    {section.subheading && (
                      <p className="project-page__section-subheading">{section.subheading}</p>
                    )}
                    {section.body && <RichText className="project-page__section-body" data={section.body} />}

                    {mediaItems.length > 0 && (
                      <div
                        className={
                          section.layout === 'two-up'
                            ? 'project-page__section-media project-page__section-media--two-up'
                            : 'project-page__section-media'
                        }
                      >
                        {mediaItems.map((item) => {
                          const mediaResource = typeof item.media === 'object' && item.media ? item.media : null
                          const mediaWidth =
                            typeof mediaResource?.width === 'number' ? mediaResource.width : null
                          const mediaHeight =
                            typeof mediaResource?.height === 'number' ? mediaResource.height : null
                          const hasAspectRatio =
                            mediaWidth !== null &&
                            mediaHeight !== null &&
                            mediaWidth > 0 &&
                            mediaHeight > 0
                          const isPortraitMedia = hasAspectRatio && mediaHeight > mediaWidth

                          return (
                            <div
                              className={
                                isPortraitMedia
                                  ? 'project-page__section-media-item project-page__section-media-item--portrait'
                                  : 'project-page__section-media-item'
                              }
                              key={item.id || String(item.media)}
                            >
                              {mediaResource && (
                                <Media
                                  className="project-page__section-media-wrapper"
                                  pictureClassName="project-page__media-picture"
                                  imgClassName="project-page__media-image"
                                  videoClassName="project-page__media-video"
                                  resource={mediaResource}
                                  videoAutoPlay={item.autoplay ?? true}
                                  videoLoop={item.loop ?? true}
                                  videoMuted={item.muted ?? true}
                                  videoControls={item.controls ?? false}
                                  videoPlaysInline={item.playsInline ?? true}
                                />
                              )}
                              {item.caption && <p className="project-page__image-caption">{item.caption}</p>}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </article>
                )
              })}
            </section>
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug(decodedSlug)

  if (!project) {
    return {
      title: 'Project | Angus MacMinn',
    }
  }

  return {
    title: `${project.title} | Angus MacMinn`,
    description: project.subtitle || project.overview || undefined,
  }
}

const queryProjectBySlug = cache(async (slug: string): Promise<RequiredDataFromCollectionSlug<'projects'> | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

