import type { Metadata } from 'next'

import { CMSLink } from '@/components/Link'
import { ArrowRight } from 'lucide-react'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import configPromise from '@payload-config'
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

export async function generateStaticParams() {
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
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug(decodedSlug)

  if (!project) {
    return <PayloadRedirects url={`/projects/${decodedSlug}`} />
  }

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
        {showSidebar && <ProjectKickerSidebar items={menuItems} meta={sidebarMeta} />}

        <div className="project-page__content">
          <header className="project-page__header">
            <h1 className="project-page__title">{project.title}</h1>
            {project.subtitle && <p className="project-page__subtitle">{project.subtitle}</p>}

            <div className="project-page__meta">
              {project.projectURL && (
                <CMSLink
                  appearance="default"
                  className="cta-link"
                  newTab
                  type="custom"
                  url={project.projectURL}
                >
                  <span>Visit Site</span>
                  <span className="cta-link__icon-wrap" aria-hidden>
                    <ArrowRight className="cta-link__icon" size={24} strokeWidth={2} />
                  </span>
                </CMSLink>
              )}
            </div>
          </header>

          {typeof project.heroImage === 'object' && project.heroImage && (
            <section className="project-page__hero-image">
              <Media resource={project.heroImage} />
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
                return (
                  <article className="project-page__section" key={section.id || section.heading} id={id}>
                    {section.kicker && <p className="project-page__section-kicker">{section.kicker}</p>}
                    <h2 className="project-page__section-heading">{section.heading}</h2>
                    {section.subheading && (
                      <p className="project-page__section-subheading">{section.subheading}</p>
                    )}
                    {section.body && <RichText className="project-page__section-body" data={section.body} />}

                    {section.images && section.images.length > 0 && (
                      <div
                        className={
                          section.layout === 'two-up'
                            ? 'project-page__section-images project-page__section-images--two-up'
                            : 'project-page__section-images'
                        }
                      >
                        {section.images.map((item) => (
                          <div key={item.id || String(item.image)}>
                            {typeof item.image === 'object' && item.image && <Media resource={item.image} />}
                            {item.caption && <p className="project-page__image-caption">{item.caption}</p>}
                          </div>
                        ))}
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

