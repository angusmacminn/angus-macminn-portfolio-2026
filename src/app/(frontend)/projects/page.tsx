import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'

import { Media } from '@/components/Media'
import './page.scss'

export default async function ProjectsPage() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const projects = await payload.find({
    collection: 'projects',
    draft,
    depth: 1,
    limit: 100,
    overrideAccess: draft,
    pagination: false,
    sort: 'sortOrder,-year',
  })

  return (
    <article className="projects-page container">
      <h1 className="projects-page__heading">Projects</h1>
      <p className="projects-page__intro">
        Selected work across product design, front-end engineering, and digital storytelling.
      </p>

      <div className="projects-page__grid">
        {projects.docs.map((project) => {
          const projectWithLegacyHero = project as typeof project & {
            heroImage?: typeof project.heroMedia
          }
          const heroMedia = project.heroMedia ?? projectWithLegacyHero.heroImage

          return (
            <article className="projects-page__card" key={project.id}>
            <Link className="projects-page__card-link" href={`/projects/${project.slug}`}>
              <h2 className="projects-page__card-title">{project.title}</h2>
            </Link>

            {project.subtitle && <p className="projects-page__card-subtitle">{project.subtitle}</p>}

            {typeof heroMedia === 'object' && heroMedia && (
              <div className="projects-page__card-image">
                <Media resource={heroMedia} />
              </div>
            )}

            <div className="projects-page__card-meta">
              {project.year && <span className="projects-page__card-year">{project.year}</span>}
              {project.projectURL && (
                <Link className="projects-page__visit-link" href={project.projectURL} rel="noreferrer" target="_blank">
                  Visit site
                </Link>
              )}
            </div>
            </article>
          )
        })}
      </div>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Projects | Angus MacMinn',
  description: 'Portfolio projects and case studies by Angus MacMinn.',
}

