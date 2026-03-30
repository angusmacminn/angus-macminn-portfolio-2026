import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import './page.scss'

export default async function PlaygroundPage() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const page = await queryPageBySlug('playground')

  const experiments = await payload.find({
    collection: 'playground',
    draft,
    depth: 1,
    limit: 100,
    overrideAccess: draft,
    pagination: false,
    sort: '-publishedAt',
  })

  return (
    <article className="playground-page container">
      <header className="playground-page__header">
        <h1 className="playground-page__heading">{page?.pageHeading || 'Playground'}</h1>
        <p className="playground-page__intro">
          {page?.pageSubheading ||
            'A running collection of creative coding experiments, interaction studies, and animation prototypes.'}
        </p>
      </header>

      <div className="playground-page__grid">
        {experiments.docs.map((item) => (
          <article className="playground-page__card" key={item.slug}>
            {typeof item.previewImage === 'object' && item.previewImage ? (
              <div className="playground-page__preview playground-page__preview--media">
                <Media resource={item.previewImage} />
              </div>
            ) : (
              <div className="playground-page__preview" aria-hidden />
            )}

            <h2 className="playground-page__card-title">
              <Link href={`/playground/${item.slug}`}>{item.title}</Link>
            </h2>
            {item.description && <p className="playground-page__card-description">{item.description}</p>}

            <ul className="playground-page__tags" aria-label={`${item.title} technologies`}>
              {item.tech?.map((tag) => (
                <li key={tag.id ?? tag.name}>{tag.name}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </article>
  )
}

const queryPageBySlug = cache(async (slug: string): Promise<RequiredDataFromCollectionSlug<'pages'> | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    depth: 1,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

export const metadata: Metadata = {
  title: 'Playground | Angus MacMinn',
  description: 'Creative coding experiments and animation studies by Angus MacMinn.',
}

