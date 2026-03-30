import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

export const Writing: CollectionConfig<'writing'> = {
  slug: 'writing',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'updatedAt'],
  },
  defaultPopulate: {
    title: true,
    slug: true,
    excerpt: true,
    publishedAt: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] })]
        },
      }),
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}

