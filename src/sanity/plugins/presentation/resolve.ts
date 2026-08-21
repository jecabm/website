import {map} from 'rxjs'
import type {DocumentLocationResolver, DocumentResolver} from 'sanity/presentation'

/**
 * Maps a singleton page document (e.g. `homePage-au`) to the frontend
 * route(s) it appears on, so Presentation's "Open preview" / location
 * breadcrumbs know where to point. AU and CO variants of a page currently
 * render at the same URL (the frontend toggles country client-side), so
 * both ids resolve to one location.
 */
const pageLocations: Record<string, {title: string; href: string}> = {
  homePage: {title: 'Homepage', href: '/'},
  featuresPage: {title: 'Features', href: '/features'},
  pricingPage: {title: 'Pricing', href: '/pricing'},
  aboutPage: {title: 'About', href: '/about'},
  contactPage: {title: 'Contact', href: '/contact'},
}

/**
 * Collection document types: unlike the singleton pages above, each document
 * renders at its own slug-based URL (or, for types with no detail page, the
 * shared listing page).
 */
const collectionLocations: Record<string, {title: string; listHref: string; slugHref?: (slug: string) => string}> = {
  post: {title: 'Blog Post', listHref: '/resources/blog', slugHref: (slug) => `/resources/blog/${slug}`},
  learningItem: {title: 'Learning Centre', listHref: '/resources/learning'},
  videoTutorial: {title: 'Learning Centre', listHref: '/resources/learning'},
  product: {title: 'Shop Product', listHref: '/shop', slugHref: (slug) => `/shop/${slug}`},
}

/**
 * The frontend serves the Colombia variant of each singleton page at a
 * `/co`-prefixed route (see src/proxy.ts), so that route is what lets
 * Presentation tell the AU and CO documents apart — without this, both
 * shared the same `/` (etc.) route and Presentation had no way to know
 * which of the two same-type documents to open, so it always picked one
 * arbitrarily (in practice, always AU).
 */
export const resolveMainDocuments: DocumentResolver[] = [
  {route: '/', filter: '_id == "homePage-au"'},
  {route: '/co', filter: '_id == "homePage-co"'},
  {route: '/features', filter: '_id == "featuresPage-au"'},
  {route: '/co/features', filter: '_id == "featuresPage-co"'},
  {route: '/pricing', filter: '_id == "pricingPage-au"'},
  {route: '/co/pricing', filter: '_id == "pricingPage-co"'},
  {route: '/about', filter: '_id == "aboutPage-au"'},
  {route: '/co/about', filter: '_id == "aboutPage-co"'},
  {route: '/contact', filter: '_id == "contactPage-au"'},
  {route: '/co/contact', filter: '_id == "contactPage-co"'},
  {route: '/resources/blog', type: 'post'},
  {route: '/resources/blog/:slug', type: 'post'},
  {route: '/resources/learning', type: 'learningItem'},
  {route: '/resources/learning', type: 'videoTutorial'},
  {route: '/shop', type: 'product'},
  {route: '/shop/:slug', type: 'product'},
]

export const resolveLocations: DocumentLocationResolver = (params, context) => {
  const {id, type} = params

  const collection = collectionLocations[type]
  if (collection) {
    if (!collection.slugHref) {
      return {locations: [{title: collection.title, href: collection.listHref}]}
    }
    return context.documentStore
      .listenQuery(`*[_id == $id][0].slug.current`, {id}, {perspective: 'previewDrafts'})
      .pipe(
        map((slug: string | undefined) => ({
          locations: [
            {title: collection.title, href: slug ? collection.slugHref!(slug) : collection.listHref},
          ],
        }))
      )
  }

  const location = pageLocations[type]
  if (!location) return null

  const isCo = id.endsWith('-co')
  const country = isCo ? 'Colombia' : 'Australia'
  const href = isCo ? (location.href === '/' ? '/co' : `/co${location.href}`) : location.href

  return {
    locations: [
      {
        title: `${location.title} — ${country}`,
        href,
      },
    ],
  }
}
