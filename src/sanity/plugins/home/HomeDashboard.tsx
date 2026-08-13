'use client'

import {useEffect, useMemo, useState} from 'react'
import {useClient, useCurrentUser} from 'sanity'

import {apiVersion} from '../../env'

type TypeName =
  | 'homePage'
  | 'featuresPage'
  | 'pricingPage'
  | 'aboutPage'
  | 'contactPage'
  | 'post'
  | 'learningItem'
  | 'videoTutorial'
  | 'product'
  | 'testimonial'
  | 'teamMember'

interface RawDoc {
  _id: string
  _type: TypeName
  _updatedAt: string
  title: string | null
  country?: string
}

interface DocRow {
  rawId: string
  type: TypeName
  updatedAt: string
  title: string
  isDraft: boolean
}

const TYPE_LABEL: Record<TypeName, string> = {
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

const COUNTRY_LABEL: Record<string, string> = {
  au: 'Australia',
  co: 'Colombia',
}

const PAGE_TYPES: TypeName[] = ['homePage', 'featuresPage', 'pricingPage', 'aboutPage', 'contactPage']

const CREATE_ACTIONS: {type: TypeName; label: string}[] = [
  {type: 'post', label: '+ Blog Post'},
  {type: 'product', label: '+ Product'},
  {type: 'testimonial', label: '+ Testimonial'},
  {type: 'learningItem', label: '+ FAQ'},
]

const CONTENT_GROUPS: {label: string; types: TypeName[]}[] = [
  {label: 'Marketing Pages', types: PAGE_TYPES},
  {label: 'Content', types: ['post', 'learningItem', 'videoTutorial']},
  {label: 'Commerce', types: ['product']},
  {label: 'Social Proof', types: ['testimonial', 'teamMember']},
]

const ALL_TYPES: TypeName[] = [
  ...PAGE_TYPES,
  'post',
  'learningItem',
  'videoTutorial',
  'product',
  'testimonial',
  'teamMember',
]

function displayTitle(type: TypeName, title: string | null, country?: string): string {
  if (PAGE_TYPES.includes(type)) {
    const countryLabel = country ? COUNTRY_LABEL[country] || country : ''
    return countryLabel ? `${TYPE_LABEL[type]} — ${countryLabel}` : TYPE_LABEL[type]
  }
  return title || '(Untitled)'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function editIntentHref(rawId: string, type: TypeName): string {
  return `/studio/intent/edit/id=${encodeURIComponent(rawId)};type=${type}`
}

function createIntentHref(type: TypeName): string {
  return `/studio/intent/create/type=${type}`
}

export function HomeDashboard() {
  const client = useClient({apiVersion})
  const user = useCurrentUser()
  const [docs, setDocs] = useState<RawDoc[] | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    client
      .fetch<RawDoc[]>(
        `*[_type in $types]{_id, _type, _updatedAt, "title": coalesce(title, question, name, null), country}`,
        {types: ALL_TYPES}
      )
      .then((result) => {
        if (!cancelled) setDocs(result)
      })
      .catch(() => {
        if (!cancelled) setDocs([])
      })
    return () => {
      cancelled = true
    }
  }, [client])

  const rows = useMemo<DocRow[]>(() => {
    if (!docs) return []
    const byRawId = new Map<string, DocRow>()
    for (const doc of docs) {
      const isDraft = doc._id.startsWith('drafts.')
      const rawId = isDraft ? doc._id.slice('drafts.'.length) : doc._id
      const existing = byRawId.get(rawId)
      // Prefer the draft version if one exists, since it reflects the latest edit
      if (!existing || isDraft) {
        byRawId.set(rawId, {
          rawId,
          type: doc._type,
          updatedAt: doc._updatedAt,
          title: displayTitle(doc._type, doc.title, doc.country),
          isDraft,
        })
      }
    }
    return Array.from(byRawId.values())
  }, [docs])

  const draftsInProgress = useMemo(
    () =>
      rows
        .filter((r) => r.isDraft)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 10),
    [rows]
  )

  const publishedCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const group of CONTENT_GROUPS) {
      counts[group.label] = rows.filter((r) => group.types.includes(r.type) && !r.isDraft).length
    }
    return counts
  }, [rows])

  const totalPublished = useMemo(() => rows.filter((r) => !r.isDraft).length, [rows])

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return rows.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 8)
  }, [query, rows])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
    const name = user?.name?.split(' ')[0] || 'there'
    return `Good ${part}, ${name}`
  }, [user])

  return (
    <div style={{padding: '2rem', fontFamily: 'inherit', maxWidth: '1100px', margin: '0 auto'}}>
      <h1
        style={{
          margin: '0 0 1.5rem',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--card-fg-color, #101112)',
          letterSpacing: '-0.01em',
        }}
      >
        {greeting}
      </h1>

      {/* Search */}
      <div style={{position: 'relative', marginBottom: '1.5rem'}}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search content — pages, posts, products, testimonials..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.85rem 1.1rem',
            fontSize: '0.9rem',
            borderRadius: '999px',
            border: '1px solid var(--card-border-color, #e5e7eb)',
            background: 'var(--card-bg-color, #fff)',
            color: 'var(--card-fg-color, #101112)',
            outline: 'none',
          }}
        />
        {searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 10,
              background: 'var(--card-bg-color, #fff)',
              border: '1px solid var(--card-border-color, #e5e7eb)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
          >
            {searchResults.map((r) => (
              <a
                key={r.rawId}
                href={editIntentHref(r.rawId, r.type)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1.1rem',
                  fontSize: '0.85rem',
                  color: 'var(--card-fg-color, #101112)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--card-border-color, #f0f0f0)',
                }}
              >
                <span>{r.title}</span>
                <span style={{color: 'var(--muted-fg-color, #6b7280)'}}>{TYPE_LABEL[r.type]}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Create new */}
      <div
        style={{
          border: '1px solid var(--card-border-color, #e5e7eb)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          background: 'var(--card-bg-color, #fff)',
        }}
      >
        <h3
          style={{
            margin: '0 0 0.9rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--card-fg-color, #101112)',
          }}
        >
          Create new
        </h3>
        <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
          {CREATE_ACTIONS.map((action) => (
            <a
              key={action.type}
              href={createIntentHref(action.type)}
              style={{
                flex: '1 1 140px',
                textAlign: 'center',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--card-border-color, #e5e7eb)',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--card-fg-color, #101112)',
                textDecoration: 'none',
              }}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>

      {/* Drafts + Content overview */}
      <div style={{display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap'}}>
        <div
          style={{
            flex: '2 1 480px',
            border: '1px solid var(--card-border-color, #e5e7eb)',
            borderRadius: '12px',
            background: 'var(--card-bg-color, #fff)',
            overflow: 'hidden',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem'}}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#fff',
                fontSize: '1rem',
              }}
            >
              ⏱
            </div>
            <div>
              <h3 style={{margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--card-fg-color, #101112)'}}>
                Drafts in progress
              </h3>
              <p style={{margin: 0, fontSize: '0.78rem', color: 'var(--muted-fg-color, #6b7280)'}}>
                {draftsInProgress.length} unpublished changes
              </p>
            </div>
          </div>
          <div>
            {docs === null && (
              <p style={{padding: '0 1.25rem 1.25rem', fontSize: '0.85rem', color: 'var(--muted-fg-color, #6b7280)'}}>
                Loading…
              </p>
            )}
            {docs !== null && draftsInProgress.length === 0 && (
              <p style={{padding: '0 1.25rem 1.25rem', fontSize: '0.85rem', color: 'var(--muted-fg-color, #6b7280)'}}>
                No drafts in progress.
              </p>
            )}
            {draftsInProgress.map((d) => (
              <a
                key={d.rawId}
                href={editIntentHref(d.rawId, d.type)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1.25rem',
                  borderTop: '1px solid var(--card-border-color, #f0f0f0)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <div style={{fontSize: '0.85rem', fontWeight: 500, color: 'var(--card-fg-color, #101112)'}}>
                    {d.title}
                  </div>
                  <div style={{fontSize: '0.75rem', color: 'var(--muted-fg-color, #6b7280)'}}>
                    {TYPE_LABEL[d.type]}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    color: '#ea580c',
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '999px',
                    padding: '2px 10px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDate(d.updatedAt)}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: '1 1 260px',
            border: '1px solid var(--card-border-color, #e5e7eb)',
            borderRadius: '12px',
            background: 'var(--card-bg-color, #fff)',
            padding: '1.25rem',
          }}
        >
          <h3 style={{margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--card-fg-color, #101112)'}}>
            Content overview
          </h3>
          <p style={{margin: '0 0 1rem', fontSize: '0.78rem', color: 'var(--muted-fg-color, #6b7280)'}}>
            {totalPublished} published documents
          </p>
          {CONTENT_GROUPS.map((group, i) => (
            <div
              key={group.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--card-border-color, #f0f0f0)',
              }}
            >
              <span style={{fontSize: '0.85rem', color: 'var(--card-fg-color, #101112)'}}>{group.label}</span>
              <span style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--card-fg-color, #101112)'}}>
                {publishedCounts[group.label] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
