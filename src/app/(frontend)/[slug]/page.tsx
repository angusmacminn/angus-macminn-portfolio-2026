import type { Metadata } from 'next'
import type { Project } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { HomeAboutSection, HomeHeroSection, HomeServicesSection, HomeWorksSection } from '@/components/Home'
import './page.scss'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const isHomePage = decodedSlug === 'home'
  const homeProjects = isHomePage ? await queryHomeProjects(page, draft) : []

  return (
    <article className="content-page">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <HomeHeroSection {...hero} />
      {isHomePage ? (
        <>
        <HomeWorksSection
            heading={page.worksHeading}
            intro={page.worksIntro}
            projects={homeProjects}
          />
          <HomeAboutSection heading={page.aboutHeading} body={page.aboutBody} image={page.aboutImage} />
          
          <HomeServicesSection
            heading={page.servicesHeading}
            intro={page.servicesIntro}
            services={page.services}
          />
          <RenderBlocks blocks={layout || []} />
        </>
      ) : (
        <RenderBlocks blocks={layout || []} />
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
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

async function queryHomeProjects(
  page: RequiredDataFromCollectionSlug<'pages'>,
  draft: boolean,
): Promise<Project[]> {
  const payload = await getPayload({ config: configPromise })
  const relatedProjectIDs =
    page.relatedProjects
      ?.map((project) => (typeof project === 'string' ? project : project.id))
      .filter(Boolean) ?? []

  if (relatedProjectIDs.length > 0) {
    const result = await payload.find({
      collection: 'projects',
      draft,
      depth: 1,
      limit: relatedProjectIDs.length,
      overrideAccess: draft,
      pagination: false,
      where: {
        id: {
          in: relatedProjectIDs,
        },
      },
    })

    const docsById = new Map(result.docs.map((doc) => [doc.id, doc]))
    return relatedProjectIDs
      .map((id) => docsById.get(id))
      .filter((project): project is Project => Boolean(project))
  }

  if (!page.showFeaturedProjects) {
    return []
  }

  const featuredResult = await payload.find({
    collection: 'projects',
    draft,
    depth: 1,
    limit: 6,
    overrideAccess: draft,
    pagination: false,
    sort: '-year',
    where: {
      featured: {
        equals: true,
      },
    },
  })

  return featuredResult.docs
}
