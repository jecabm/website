import { SearchIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Reusable SEO object — add `defineField({ name: 'seo', type: 'seo' })` to any
 * document schema to give editors per-page SEO control. Consumed in Next.js
 * via the shared SEO-fetching/generateMetadata helper (Phase 2).
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'social', title: 'Social sharing' },
    { name: 'advanced', title: 'Advanced' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'SEO Title',
      type: 'string',
      group: 'general',
      description: 'Shown in search results and the browser tab. Aim for 50–60 characters.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          if (value.length < 50 || value.length > 60) {
            return `${value.length} characters — aim for 50–60 for best display in search results.`
          }
          return true
        }).warning(),
    }),
    defineField({
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      group: 'general',
      description: 'Summary shown under the title in search results. Aim for 140–160 characters.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          if (value.length < 140 || value.length > 160) {
            return `${value.length} characters — aim for 140–160 for best display in search results.`
          }
          return true
        }).warning(),
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
      group: 'general',
      description: 'The primary term this page should rank for. Used by the SEO assistant (Phase 7).',
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      group: 'general',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
      description: 'Secondary keywords/topics relevant to this page.',
    }),

    defineField({
      name: 'ogTitle',
      title: 'Open Graph Title',
      type: 'string',
      group: 'social',
      description: 'Falls back to SEO Title if left blank.',
    }),
    defineField({
      name: 'ogDescription',
      title: 'Open Graph Description',
      type: 'text',
      rows: 3,
      group: 'social',
      description: 'Falls back to Meta Description if left blank.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      group: 'social',
      options: { hotspot: true },
      description: 'Recommended 1200×630px. Falls back to the global default social image if left blank.',
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
      ],
    }),
    defineField({
      name: 'twitterTitle',
      title: 'Twitter Title',
      type: 'string',
      group: 'social',
      description: 'Falls back to Open Graph Title, then SEO Title, if left blank.',
    }),
    defineField({
      name: 'twitterDescription',
      title: 'Twitter Description',
      type: 'text',
      rows: 3,
      group: 'social',
      description: 'Falls back to Open Graph Description, then Meta Description, if left blank.',
    }),
    defineField({
      name: 'twitterImage',
      title: 'Twitter Image',
      type: 'image',
      group: 'social',
      options: { hotspot: true },
      description: 'Falls back to Open Graph Image if left blank.',
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
      ],
    }),

    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      group: 'advanced',
      description: 'Only set this if this page is a duplicate of another URL. Leave blank in almost all cases.',
      validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index',
      type: 'boolean',
      group: 'advanced',
      initialValue: false,
      description: 'Prevent search engines from indexing this page.',
    }),
    defineField({
      name: 'noFollow',
      title: 'No Follow',
      type: 'boolean',
      group: 'advanced',
      initialValue: false,
      description: 'Prevent search engines from following links on this page.',
    }),
  ],
})
