import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { MediaBlock } from '@/blocks/MediaBlock/config'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder', 'year', 'featured', 'updatedAt'],
  },
  defaultPopulate: {
    title: true,
    slug: true,
    subtitle: true,
    role: true,
    year: true,
    sortOrder: true,
    featured: true,
    heroMedia: true,
    cardDescription: true,
    cardThumbnail: true,
    cardResponsibilities: true,
    cardTags: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'subtitle',
              type: 'textarea',
            },
            {
              name: 'overview',
              type: 'textarea',
            },
            {
              name: 'heroMedia',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Hero media',
            },
            {
              name: 'heroCaption',
              type: 'text',
            },
            {
              name: 'projectURL',
              type: 'text',
            },
            {
              name: 'repoURL',
              type: 'text',
            },
            {
              name: 'role',
              type: 'text',
            },
            {
              name: 'client',
              type: 'text',
            },
            {
              name: 'timeline',
              type: 'text',
            },
            {
              name: 'year',
              type: 'number',
            },
            {
              name: 'stack',
              type: 'array',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          label: 'Card',
          fields: [
            {
              name: 'cardDescription',
              type: 'textarea',
              label: 'Description',
              admin: {
                description: 'Short plain text shown on project cards (not rich text).',
              },
            },
            {
              name: 'cardThumbnail',
              type: 'upload',
              relationTo: 'media',
              label: 'Image thumbnail',
            },
            {
              name: 'cardResponsibilities',
              type: 'textarea',
              label: 'What I did',
            },
            {
              name: 'cardTags',
              type: 'array',
              labels: {
                singular: 'Tag',
                plural: 'Tags',
              },
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Case Study',
          fields: [
            {
              name: 'story',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                  ]
                },
              }),
            },
            {
              name: 'sections',
              type: 'array',
              labels: {
                plural: 'Sections',
                singular: 'Section',
              },
              fields: [
                {
                  name: 'kicker',
                  type: 'text',
                },
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'subheading',
                  type: 'textarea',
                },
                {
                  name: 'body',
                  type: 'richText',
                  editor: lexicalEditor({
                    features: ({ rootFeatures }) => {
                      return [
                        ...rootFeatures,
                        HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                        BlocksFeature({ blocks: [MediaBlock] }),
                        FixedToolbarFeature(),
                        InlineToolbarFeature(),
                      ]
                    },
                  }),
                },
                {
                  name: 'layout',
                  type: 'select',
                  defaultValue: 'single',
                  options: [
                    {
                      label: 'Single Column',
                      value: 'single',
                    },
                    {
                      label: 'Two Up',
                      value: 'two-up',
                    },
                    {
                      label: 'Full Bleed',
                      value: 'full-bleed',
                    },
                  ],
                },
                {
                  name: 'mediaItems',
                  type: 'array',
                  label: 'Section media',
                  maxRows: 2,
                  fields: [
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'caption',
                      type: 'text',
                    },
                    {
                      name: 'autoplay',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Automatically play video when possible.',
                      },
                    },
                    {
                      name: 'loop',
                      type: 'checkbox',
                      defaultValue: true,
                    },
                    {
                      name: 'muted',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Most browsers require muted videos for autoplay.',
                      },
                    },
                    {
                      name: 'controls',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'playsInline',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Plays inline',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Manual ordering for project lists. Lower numbers appear first.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    slugField(),
  ],
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}