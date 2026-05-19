import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import '../page.scss'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const items = await payload.find({
      collection: 'playground',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    return items.docs.map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}

export default async function PlaygroundExperimentPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const experiment = await queryPlaygroundBySlug(slug)

  if (!experiment) notFound()

  return (
    <article className="playground-page container">
      <header className="playground-page__header">
        <h1 className="playground-page__heading">{experiment.title}</h1>
        {experiment.description && <p className="playground-page__intro">{experiment.description}</p>}
      </header>

      {typeof experiment.previewImage === 'object' && experiment.previewImage ? (
        <div className="playground-page__detail-preview playground-page__detail-preview--media">
          <Media resource={experiment.previewImage} />
        </div>
      ) : (
        <div className="playground-page__detail-preview" aria-label={`${experiment.title} preview placeholder`} />
      )}

      <ul className="playground-page__tags playground-page__tags--detail" aria-label={`${experiment.title} technologies`}>
        {experiment.tech?.map((tag) => (
          <li key={tag.id ?? tag.name}>{tag.name}</li>
        ))}
      </ul>

      {experiment.notes && <RichText className="playground-page__notes" data={experiment.notes} />}

      <div className="playground-page__links">
        {experiment.demoURL && (
          <Link className="playground-page__link" href={experiment.demoURL} rel="noreferrer" target="_blank">
            View demo
          </Link>
        )}
        {experiment.repoURL && (
          <Link className="playground-page__link" href={experiment.repoURL} rel="noreferrer" target="_blank">
            View code
          </Link>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const experiment = await queryPlaygroundBySlug(slug)

  if (!experiment) {
    return {
      title: 'Playground | Angus MacMinn',
    }
  }

  return {
    title: `${experiment.title} | Playground`,
    description: experiment.description || undefined,
  }
}

const queryPlaygroundBySlug = cache(
  async (slug: string): Promise<RequiredDataFromCollectionSlug<'playground'> | null> => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'playground',
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
  },
)

