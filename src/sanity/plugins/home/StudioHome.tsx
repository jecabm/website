'use client'

import {useEffect, useMemo, useState} from 'react'
import {useClient, useCurrentUser} from 'sanity'
import {IntentLink} from 'sanity/router'

import {apiVersion} from '../../env'
import {
  CONTENT_TYPES,
  DocSummary,
  SeoSummary,
  TYPE_GROUPS,
  TYPE_LABELS,
  baseId,
  draftsCountQuery,
  draftsQuery,
  getDocLabel,
  groupCountsQuery,
  quickFindQuery,
  recentlyUpdatedQuery,
  seoHealthQuery,
  timeAgo,
} from './queries'

const card: React.CSSProperties = {
  borderRadius: '12px',
  border: '1px solid var(--card-border-color, #e5e7eb)',
  background: 'var(--card-bg-color, #fff)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
}

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 700,
  color: 'var(--card-fg-color, #101112)',
}

const muted: React.CSSProperties = {
  color: 'var(--muted-fg-color, #6b7280)',
}

function IconChip({children, gradient}: {children: React.ReactNode; gradient: string}) {
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'white',
      }}
    >
      {children}
    </div>
  )
}

const ORANGE = 'linear-gradient(135deg, #f97316, #ea580c)'

const CREATE_ACTIONS: {type: string; label: string}[] = [
  {type: 'post', label: 'Blog Post'},
  {type: 'product', label: 'Product'},
  {type: 'testimonial', label: 'Testimonial'},
  {type: 'learningItem', label: 'FAQ'},
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function StudioHome() {
  const client = useClient({apiVersion})
  const user = useCurrentUser()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DocSummary[]>([])
  const [searching, setSearching] = useState(false)

  const [drafts, setDrafts] = useState<DocSummary[]>([])
  const [draftsCount, setDraftsCount] = useState(0)
  const [recent, setRecent] = useState<DocSummary[]>([])
  const [groupCounts, setGroupCounts] = useState<number[]>([])
  const [seoDocs, setSeoDocs] = useState<SeoSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      client.fetch<DocSummary[]>(draftsQuery, {types: CONTENT_TYPES}),
      client.fetch<number>(draftsCountQuery, {types: CONTENT_TYPES}),
      client.fetch<DocSummary[]>(recentlyUpdatedQuery, {types: CONTENT_TYPES}),
      client.fetch<{[key: string]: number}>(groupCountsQuery),
      client.fetch<SeoSummary[]>(seoHealthQuery),
    ])
      .then(([d, dc, r, gc, seo]) => {
        if (cancelled) return
        setDrafts(d)
        setDraftsCount(dc)
        setRecent(r)
        setGroupCounts(TYPE_GROUPS.map((_, i) => gc[`g${i}`] ?? 0))
        setSeoDocs(seo)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [client])

  useEffect(() => {
    const trimmed = query.trim()
    const handle = setTimeout(() => {
      if (!trimmed) {
        setResults([])
        return
      }
      setSearching(true)
      client
        .fetch<DocSummary[]>(quickFindQuery, {types: CONTENT_TYPES, q: `${trimmed}*`})
        .then(setResults)
        .finally(() => setSearching(false))
    }, 250)
    return () => clearTimeout(handle)
  }, [query, client])

  const seoStats = useMemo(() => {
    const missingTitle = seoDocs.filter((d) => !d.seoTitle).length
    const missingDescription = seoDocs.filter((d) => !d.seoDescription).length
    const missingImage = seoDocs.filter((d) => !d.hasImage).length
    const needsAttention = seoDocs.filter((d) => !d.seoTitle || !d.seoDescription || !d.hasImage).length
    return {missingTitle, missingDescription, missingImage, needsAttention}
  }, [seoDocs])

  const totalDocs = groupCounts.reduce((sum, n) => sum + n, 0)

  return (
    <div style={{padding: '2rem', fontFamily: 'inherit', maxWidth: '1120px', margin: '0 auto'}}>
      {/* Greeting */}
      <h1
        style={{
          textAlign: 'center',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--card-fg-color, #101112)',
          margin: '0.5rem 0 1.5rem',
        }}
      >
        {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>

      {/* Quick find */}
      <div style={{position: 'relative', marginBottom: '1.25rem'}}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search content — pages, posts, products, testimonials…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.875rem 1.25rem',
            borderRadius: '999px',
            border: '1px solid var(--card-border-color, #e5e7eb)',
            background: 'var(--card-bg-color, #fff)',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        {(query.trim() && (searching || results.length > 0)) && (
          <div
            style={{
              ...card,
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            {searching && (
              <div style={{padding: '1rem', fontSize: '0.85rem', ...muted}}>Searching…</div>
            )}
            {!searching && results.length === 0 && (
              <div style={{padding: '1rem', fontSize: '0.85rem', ...muted}}>No matches for &quot;{query}&quot;</div>
            )}
            {!searching &&
              results.map((doc) => (
                <IntentLink
                  key={doc._id}
                  intent="edit"
                  params={{id: baseId(doc._id), type: doc._type}}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.7rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--card-fg-color, #101112)',
                    borderTop: '1px solid var(--card-border-color, #f3f4f6)',
                    fontSize: '0.875rem',
                  }}
                >
                  <span>{getDocLabel(doc)}</span>
                  <span style={{fontSize: '0.75rem', ...muted}}>{TYPE_LABELS[doc._type]}</span>
                </IntentLink>
              ))}
          </div>
        )}
      </div>

      {/* Create new */}
      <div style={{...card, padding: '1.25rem', marginBottom: '1.25rem'}}>
        <p style={{...sectionTitle, marginBottom: '0.875rem'}}>Create new</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem'}}>
          {CREATE_ACTIONS.map(({type, label}) => (
            <IntentLink
              key={type}
              intent="create"
              params={{type}}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--card-border-color, #e5e7eb)',
                textDecoration: 'none',
                color: 'var(--card-fg-color, #101112)',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
            >
              + {label}
            </IntentLink>
          ))}
        </div>
      </div>

      {/* Drafts + Content overview */}
      <div style={{display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', marginBottom: '1.25rem'}}>
        <div style={card}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.25rem 0.5rem'}}>
            <IconChip gradient={ORANGE}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4l3 3M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconChip>
            <div>
              <p style={sectionTitle}>Drafts in progress</p>
              <p style={{margin: 0, fontSize: '0.8rem', ...muted}}>{draftsCount} unpublished {draftsCount === 1 ? 'change' : 'changes'}</p>
            </div>
          </div>
          <div>
            {loading && <div style={{padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', ...muted}}>Loading…</div>}
            {!loading && drafts.length === 0 && (
              <div style={{padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', ...muted}}>Nothing in draft — everything is published.</div>
            )}
            {!loading &&
              drafts.map((doc, i) => (
                <IntentLink
                  key={doc._id}
                  intent="edit"
                  params={{id: baseId(doc._id), type: doc._type}}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.25rem',
                    textDecoration: 'none',
                    color: 'var(--card-fg-color, #101112)',
                    borderTop: i > 0 ? '1px solid var(--card-border-color, #f3f4f6)' : 'none',
                  }}
                >
                  <div style={{minWidth: 0}}>
                    <div style={{fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {getDocLabel(doc)}
                    </div>
                    <div style={{fontSize: '0.75rem', ...muted}}>{TYPE_LABELS[doc._type]}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#c2410c',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderRadius: '999px',
                      padding: '2px 8px',
                      flexShrink: 0,
                    }}
                  >
                    {timeAgo(doc._updatedAt)}
                  </span>
                </IntentLink>
              ))}
          </div>
        </div>

        <div style={card}>
          <div style={{padding: '1.25rem 1.25rem 0.5rem'}}>
            <p style={sectionTitle}>Content overview</p>
            <p style={{margin: 0, fontSize: '0.8rem', ...muted}}>{totalDocs} published documents</p>
          </div>
          <div>
            {TYPE_GROUPS.map((group, i) => (
              <div
                key={group.title}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.6rem 1.25rem',
                  borderTop: '1px solid var(--card-border-color, #f3f4f6)',
                  fontSize: '0.85rem',
                }}
              >
                <span>{group.title}</span>
                <span style={{fontWeight: 700}}>{groupCounts[i] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEO health + Recently updated */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
        <div style={{...card, padding: '1.25rem'}}>
          <p style={sectionTitle}>SEO health</p>
          <p style={{margin: '2px 0 1rem', fontSize: '0.8rem', ...muted}}>Blog posts &amp; products missing SEO fields</p>
          <div style={{fontSize: '2rem', fontWeight: 700, color: seoStats.needsAttention > 0 ? '#c2410c' : '#16a34a'}}>
            {seoStats.needsAttention}
            <span style={{fontSize: '0.8rem', fontWeight: 400, marginLeft: '6px', ...muted}}>pages need attention</span>
          </div>
          <div style={{marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {[
              {label: 'Missing SEO title', value: seoStats.missingTitle},
              {label: 'Missing SEO description', value: seoStats.missingDescription},
              {label: 'Missing image', value: seoStats.missingImage},
            ].map(({label, value}) => (
              <div key={label} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <span style={{width: '6px', height: '6px', borderRadius: '50%', background: value > 0 ? '#f97316' : '#16a34a', display: 'inline-block'}} />
                  {label}
                </span>
                <span style={{fontWeight: 600, color: value > 0 ? '#c2410c' : 'inherit'}}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{...card, padding: '1.25rem'}}>
          <p style={sectionTitle}>Recently updated</p>
          <p style={{margin: '2px 0 1rem', fontSize: '0.8rem', ...muted}}>Across the whole Studio</p>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {loading && <div style={{fontSize: '0.85rem', ...muted}}>Loading…</div>}
            {!loading && recent.length === 0 && <div style={{fontSize: '0.85rem', ...muted}}>No published documents yet.</div>}
            {!loading &&
              recent.map((doc, i) => (
                <IntentLink
                  key={doc._id}
                  intent="edit"
                  params={{id: baseId(doc._id), type: doc._type}}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.55rem 0',
                    textDecoration: 'none',
                    color: 'var(--card-fg-color, #101112)',
                    borderTop: i > 0 ? '1px solid var(--card-border-color, #f3f4f6)' : 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{getDocLabel(doc)}</span>
                  <span style={{fontSize: '0.75rem', flexShrink: 0, ...muted}}>{timeAgo(doc._updatedAt)}</span>
                </IntentLink>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
