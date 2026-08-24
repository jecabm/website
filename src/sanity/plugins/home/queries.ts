export const CONTENT_TYPES = [
  'homePage',
  'featuresPage',
  'pricingPage',
  'aboutPage',
  'contactPage',
  'post',
  'learningItem',
  'videoTutorial',
  'product',
  'testimonial',
  'teamMember',
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]

export const TYPE_GROUPS: { title: string; types: ContentType[] }[] = [
  { title: 'Marketing Pages', types: ['homePage', 'featuresPage', 'pricingPage', 'aboutPage', 'contactPage'] },
  { title: 'Content', types: ['post', 'learningItem', 'videoTutorial'] },
  { title: 'Commerce', types: ['product'] },
  { title: 'Social Proof', types: ['testimonial', 'teamMember'] },
]

export const TYPE_LABELS: Record<ContentType, string> = {
  homePage: 'Homepage',
  featuresPage: 'Features Page',
  pricingPage: 'Pricing Page',
  aboutPage: 'About Page',
  contactPage: 'Contact Page',
  post: 'Blog Post',
  learningItem: 'FAQ',
  videoTutorial: 'Video Tutorial',
  product: 'Product',
  testimonial: 'Testimonial',
  teamMember: 'Team Member',
}

export interface DocSummary {
  _id: string
  _type: ContentType
  _updatedAt: string
  title?: string
  name?: string
  question?: string
  authorName?: string
  country?: string
}

export const COUNTRY_LABEL: Record<string, string> = { au: 'Australia', co: 'Colombia' }

export function getDocLabel(doc: DocSummary): string {
  if (doc.title) return doc.title
  if (doc.name) return doc.name
  if (doc.question) return doc.question
  if (doc.authorName) return doc.authorName
  if (doc.country) return `${TYPE_LABELS[doc._type]} — ${COUNTRY_LABEL[doc.country] ?? doc.country}`
  return TYPE_LABELS[doc._type] ?? 'Untitled'
}

export function baseId(id: string): string {
  return id.startsWith('drafts.') ? id.slice('drafts.'.length) : id
}

export function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateString).toLocaleDateString()
}

const DOC_PROJECTION = `{_id,_type,_updatedAt,title,name,question,authorName,country}`

export const draftsQuery = `*[_id in path("drafts.**") && _type in $types] | order(_updatedAt desc)[0...8]${DOC_PROJECTION}`

export const draftsCountQuery = `count(*[_id in path("drafts.**") && _type in $types])`

export const recentlyUpdatedQuery = `*[!(_id in path("drafts.**")) && _type in $types] | order(_updatedAt desc)[0...6]${DOC_PROJECTION}`

export const groupCountsQuery = `{
  ${TYPE_GROUPS.map(
    (group, i) => `"g${i}": count(*[_type in [${group.types.map((t) => `"${t}"`).join(',')}] && !(_id in path("drafts.**"))])`
  ).join(',\n  ')}
}`

export interface SeoSummary {
  _id: string
  _type: 'post' | 'product'
  title?: string
  name?: string
  seoTitle?: string
  seoDescription?: string
  hasImage: boolean
}

export const seoHealthQuery = `*[_type in ["post","product"] && !(_id in path("drafts.**"))]{
  _id, _type, title, name, seoTitle, seoDescription,
  "hasImage": defined(coverImage) || count(images) > 0
}`

export const quickFindQuery = `*[_type in $types && (
  title match $q || name match $q || question match $q || authorName match $q ||
  _type in $matchedTypes || country in $matchedCountries
)][0...8]${DOC_PROJECTION}`
