import { type SchemaTypeDefinition } from 'sanity'
import { aboutPage } from './aboutPage'
import { contactPage } from './contactPage'
import { featuresPage } from './featuresPage'
import { homePage } from './homePage'
import { learningItem } from './learningItem'
import { post } from './post'
import { pricingPage } from './pricingPage'
import { product } from './product'
import { seo } from './seo'
import { siteSettings } from './siteSettings'
import { teamMember } from './teamMember'
import { testimonial } from './testimonial'
import { videoTutorial } from './videoTutorial'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    seo,
    siteSettings,
    homePage,
    featuresPage,
    pricingPage,
    aboutPage,
    contactPage,
    post,
    testimonial,
    teamMember,
    learningItem,
    videoTutorial,
    product,
  ],
}
