import { CogIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton — one document only, id "siteSettings" (enforced via
 * src/sanity/structure.ts + sanity.config.ts newDocumentOptions filter).
 * Global fallback for SEO metadata and Organization structured data
 * (see src/lib/seo.ts and the Phase 6 JSON-LD generators).
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site SEO Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'organization', title: 'Organization' },
    { name: 'social', title: 'Social links' },
  ],
  fields: [
    defineField({
      name: 'websiteName',
      title: 'Website Name',
      type: 'string',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultTitle',
      title: 'Default Title',
      type: 'string',
      group: 'general',
      description: 'Used when a page has no SEO title of its own.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultDescription',
      title: 'Default Description',
      type: 'text',
      rows: 3,
      group: 'general',
      description: 'Used when a page has no meta description of its own.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'defaultSocialImage',
      title: 'Default Social Image',
      type: 'image',
      group: 'general',
      options: { hotspot: true },
      description: 'Used for Open Graph / Twitter when a page has no image of its own. Recommended 1200×630px.',
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
      ],
    }),

    defineField({
      name: 'organization',
      title: 'Organization',
      type: 'object',
      group: 'organization',
      description: 'Used for Organization structured data (JSON-LD).',
      fields: [
        defineField({ name: 'legalName', title: 'Legal Name', type: 'string' }),
        defineField({
          name: 'logo',
          title: 'Logo',
          type: 'image',
          fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
        }),
        defineField({ name: 'email', title: 'Contact Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Contact Phone', type: 'string' }),
      ],
    }),

    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      group: 'social',
      description: 'Used for the Organization "sameAs" structured data field.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'X / Twitter', value: 'twitter' },
                  { title: 'YouTube', value: 'youtube' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
            }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site SEO Settings' }
    },
  },
})
