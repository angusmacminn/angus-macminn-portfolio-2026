import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

const socialPlatformOptions = [
  { label: 'GitHub', value: 'github' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'X', value: 'x' },
  { label: 'Email', value: 'email' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Website', value: 'website' },
] as const

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'contactPanel',
      type: 'group',
      label: 'Contact panel',
      admin: {
        description: 'Shown when a nav item is set to “Contact panel”. Email, booking link, and social icons.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Panel heading',
          admin: {
            description: 'Shown at the top of the contact popover.',
          },
        },
        {
          name: 'email',
          type: 'text',
          label: 'Email',
          admin: {
            placeholder: 'you@domain.com',
          },
        },
        {
          name: 'calendarLabel',
          type: 'text',
          label: 'Calendar button label',
          defaultValue: 'Book a Call',
        },
        {
          name: 'calendarUrl',
          type: 'text',
          label: 'Calendar / booking URL',
          admin: {
            placeholder: 'https://cal.com/...',
          },
        },
        {
          name: 'subheading',
          type: 'textarea',
          label: 'Panel subheading',
          admin: {
            description: 'Short line at the bottom of the popover (e.g. availability or CTA hint).',
          },
        },
        {
          name: 'socialLinks',
          type: 'array',
          labels: {
            singular: 'Social link',
            plural: 'Social links',
          },
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: [...socialPlatformOptions],
              defaultValue: 'github',
            },
            link({
              appearances: false,
              disableLabel: true,
            }),
          ],
          maxRows: 6,
          admin: {
            initCollapsed: true,
          },
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'itemType',
              type: 'select',
              label: 'Navigation mode',
              defaultValue: 'link',
              admin: {
                width: '100%',
                description:
                  'Separate from “Internal link / Custom URL” in Link below. Choose Contact popover to open the dropdown instead of leaving the page.',
              },
              options: [
                { label: 'Link to a page or custom URL', value: 'link' },
                { label: 'Contact popover (email, calendar, social)', value: 'contact' },
              ],
            },
          ],
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              description:
                'Used when Navigation mode is “Link to a page…”. For Contact popover rows, only the Label is shown on the site; Internal link vs Custom URL is ignored.',
            },
          },
        }),
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
