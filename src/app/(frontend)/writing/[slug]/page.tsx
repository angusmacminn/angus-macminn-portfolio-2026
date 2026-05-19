import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import RichText from '@/components/RichText'
import '../page.scss'

type Args = {
  params: Promise<{
    slug: string
  }>
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'writing',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    return posts.docs.map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}

export default async function WritingPostPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const post = await queryWritingBySlug(slug)

  if (!post) notFound()

  const metaDate = post.publishedAt ?? post.updatedAt ?? post.createdAt

  return (
    <article className="writing-page container">
      <header className="writing-page__header">
        {metaDate ? <p className="writing-page__meta">{formatDate(metaDate)}</p> : null}
        <h1 className="writing-page__heading">{post.title}</h1>
        <p className="writing-page__intro">{post.excerpt}</p>
      </header>

      <div className="writing-page__post-body">
        {post.content && <RichText data={post.content} />}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const post = await queryWritingBySlug(slug)

  if (!post) {
    return {
      title: 'Writing | Angus MacMinn',
    }
  }

  return {
    title: `${post.title} | Writing`,
    description: post.excerpt || undefined,
  }
}

const queryWritingBySlug = cache(
  async (slug: string): Promise<RequiredDataFromCollectionSlug<'writing'> | null> => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'writing',
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

