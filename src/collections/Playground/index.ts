import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

export const Playground: CollectionConfig<'playground'> = {
  slug: 'playground',
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
    description: true,
    tech: true,
    previewImage: true,
    publishedAt: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'demoURL',
      type: 'text',
      label: 'Demo URL',
    },
    {
      name: 'repoURL',
      type: 'text',
      label: 'Repo URL',
    },
    {
      name: 'tech',
      type: 'array',
      labels: {
        singular: 'Tech tag',
        plural: 'Tech tags',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'notes',
      type: 'richText',
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

