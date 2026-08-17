import {HelpCircleIcon, PlayIcon} from '@sanity/icons'
import type { StructureResolver } from 'sanity/structure'

// Each resolver below is registered as its own `structureTool` in
// `sanity.config.ts`, so it appears as its own row in the tool rail
// (`ToolRail.tsx`), grouped visually under a section header defined in
// `plugins/shell/contentGroups.ts`. Live document counts and status dots
// shown in the rail are computed there (client-side), not here — these
// resolvers just define what opens when a row is clicked.

export const siteSettingsStructure: StructureResolver = (S) =>
  S.document().schemaType('siteSettings').documentId('siteSettings')

export const homePageStructure: StructureResolver = (S) =>
  S.list()
    .title('Homepage')
    .items([
      S.listItem().title('Australia').child(S.document().schemaType('homePage').documentId('homePage-au')),
      S.listItem().title('Colombia').child(S.document().schemaType('homePage').documentId('homePage-co')),
    ])

export const featuresPageStructure: StructureResolver = (S) =>
  S.list()
    .title('Features Page')
    .items([
      S.listItem().title('Australia').child(S.document().schemaType('featuresPage').documentId('featuresPage-au')),
      S.listItem().title('Colombia').child(S.document().schemaType('featuresPage').documentId('featuresPage-co')),
    ])

export const pricingPageStructure: StructureResolver = (S) =>
  S.list()
    .title('Pricing Page')
    .items([
      S.listItem().title('Australia').child(S.document().schemaType('pricingPage').documentId('pricingPage-au')),
      S.listItem().title('Colombia').child(S.document().schemaType('pricingPage').documentId('pricingPage-co')),
    ])

export const aboutPageStructure: StructureResolver = (S) =>
  S.list()
    .title('About Page')
    .items([
      S.listItem().title('Australia').child(S.document().schemaType('aboutPage').documentId('aboutPage-au')),
      S.listItem().title('Colombia').child(S.document().schemaType('aboutPage').documentId('aboutPage-co')),
    ])

export const contactPageStructure: StructureResolver = (S) =>
  S.list()
    .title('Contact Page')
    .items([
      S.listItem().title('Australia').child(S.document().schemaType('contactPage').documentId('contactPage-au')),
      S.listItem().title('Colombia').child(S.document().schemaType('contactPage').documentId('contactPage-co')),
    ])

export const blogResourcesStructure: StructureResolver = (S) =>
  S.documentTypeList('post').title('Blog / Resources')

export const learningCentreStructure: StructureResolver = (S) =>
  S.list()
    .title('Learning Centre')
    .items([
      S.listItem().title('FAQ').icon(HelpCircleIcon).child(S.documentTypeList('learningItem').title('FAQ')),
      S.listItem()
        .title('Video Tutorials')
        .icon(PlayIcon)
        .child(S.documentTypeList('videoTutorial').title('Video Tutorials')),
    ])

export const shopProductsStructure: StructureResolver = (S) => S.documentTypeList('product').title('Products')

export const testimonialsStructure: StructureResolver = (S) =>
  S.documentTypeList('testimonial').title('Testimonials')

export const teamMembersStructure: StructureResolver = (S) =>
  S.documentTypeList('teamMember').title('Team Members')
