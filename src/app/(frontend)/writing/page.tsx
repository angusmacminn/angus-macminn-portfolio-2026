import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import Link from 'next/link'
import './page.scss'

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function WritingPage() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const page = await queryPageBySlug('writing')

  const posts = await payload.find({
    collection: 'writing',
    draft,
    depth: 1,
    limit: 100,
    overrideAccess: draft,
    pagination: false,
    sort: '-publishedAt',
  })

  return (
    <article className="writing-page container">
      <header className="writing-page__header">
        <h1 className="writing-page__heading">{page?.pageHeading || 'Writing'}</h1>
        <p className="writing-page__intro">
          {page?.pageSubheading ||
            'Notes on design, front-end craft, and systems thinking. Short, practical posts from project work.'}
        </p>
      </header>

      <div className="writing-page__list">
        {posts.docs.map((post) => (
          <article className="writing-page__post" key={post.slug}>
            <p className="writing-page__meta">
              {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.updatedAt)}
            </p>
            <h2 className="writing-page__post-title">
              <Link href={`/writing/${post.slug}`}>{post.title}</Link>
            </h2>
            {post.excerpt && <p className="writing-page__excerpt">{post.excerpt}</p>}
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
  title: 'Writing | Angus MacMinn',
  description: 'Blog-style writing on design, front-end development, and creative systems.',
}

