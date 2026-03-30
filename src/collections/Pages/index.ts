import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { slugField } from 'payload'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { link } from '../../fields/link'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
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
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'position',
                  label: 'Secondary heading (position)',
                  type: 'text',
                },
                {
                  name: 'subheading',
                  label: 'Subheading description',
                  type: 'textarea',
                },
                {
                  name: 'location',
                  label: 'Body text (location)',
                  type: 'textarea',
                },
                {
                  name: 'cta',
                  type: 'group',
                  label: 'Call to action',
                  required: false,
                  admin: {
                    description: "Optional button below the hero (e.g. Let's talk, mailto:, or a page).",
                  },
                  fields: [
                    link({
                      appearances: false,
                    }),
                  ],
                },
              ],
            },
          ],
          label: 'Hero',
          admin: {
            condition: (data) => data?.slug === 'home',
          },
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
              required: false,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Flexible Content',
        },
        {
          label: 'About',
          admin: {
            condition: (data) => data?.slug === 'home',
          },
          fields: [
            {
              name: 'aboutHeading',
              type: 'text',
            },
            {
              name: 'aboutBody',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            },
            {
              name: 'aboutImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'toolsHeading',
              type: 'text',
              label: 'Tools section heading',
              defaultValue: 'Tools I Use',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'toolsSubheadingOne',
                  type: 'text',
                  label: 'Tools subheading 1',
                  defaultValue: 'Front-End Development',
                  admin: {
                    width: '33%',
                  },
                },
                {
                  name: 'toolsSubheadingTwo',
                  type: 'text',
                  label: 'Tools subheading 2',
                  defaultValue: 'Interaction & Motion',
                  admin: {
                    width: '33%',
                  },
                },
                {
                  name: 'toolsSubheadingThree',
                  type: 'text',
                  label: 'Tools subheading 3',
                  defaultValue: 'CMS & Architecture',
                  admin: {
                    width: '33%',
                  },
                },
              ],
            },
            {
              name: 'toolsColumnOne',
              type: 'array',
              label: 'Tools column 1 items',
              labels: {
                singular: 'Tool',
                plural: 'Tools',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
              defaultValue: [{ name: 'WordPress' }, { name: 'React' }, { name: 'Next.js' }],
            },
            {
              name: 'toolsColumnTwo',
              type: 'array',
              label: 'Tools column 2 items',
              labels: {
                singular: 'Tool',
                plural: 'Tools',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
              defaultValue: [{ name: 'GSAP' }, { name: 'Framer Motion' }, { name: 'Three.js' }],
            },
            {
              name: 'toolsColumnThree',
              type: 'array',
              label: 'Tools column 3 items',
              labels: {
                singular: 'Tool',
                plural: 'Tools',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
              defaultValue: [
                { name: 'Headless WordPress' },
                { name: 'Payload' },
                { name: 'API-driven systems' },
              ],
            },
          ],
        },
        {
          label: 'Works',
          admin: {
            condition: (data) => data?.slug === 'home',
          },
          fields: [
            {
              name: 'worksHeading',
              type: 'text',
            },
            {
              name: 'worksIntro',
              type: 'textarea',
            },
            {
              name: 'showFeaturedProjects',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'relatedProjects',
              type: 'relationship',
              relationTo: 'projects',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Services',
          admin: {
            condition: (data) => data?.slug === 'home',
          },
          fields: [
            {
              name: 'servicesHeading',
              type: 'text',
            },
            {
              name: 'servicesIntro',
              type: 'textarea',
            },
            {
              name: 'services',
              type: 'array',
              labels: {
                singular: 'Service',
                plural: 'Services',
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
              ],
            },
          ],
        },
        {
          label: 'Writing & Playground',
          admin: {
            condition: (data) => data?.slug === 'writing' || data?.slug === 'playground',
          },
          fields: [
            {
              name: 'pageHeading',
              type: 'text',
              label: 'Heading',
            },
            {
              name: 'pageSubheading',
              type: 'textarea',
              label: 'Subheading',
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
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
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
