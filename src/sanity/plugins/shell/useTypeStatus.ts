'use client'

import {useEffect, useState} from 'react'
import {useClient} from 'sanity'

import {apiVersion} from '../../env'
import {STATUS_TYPES, type StatusType} from './contentGroups'

export type TypeStatus = Record<StatusType, {count: number; hasDraft: boolean}>

// Live per-type document count + draft-status, used to render the 🟢/🟠 dot
// and count badge next to each content row in `ToolRail.tsx`. Fetched once
// client-side (not baked into a tool's static title, which can't be async).
export function useTypeStatus(): TypeStatus | null {
  const client = useClient({apiVersion})
  const [status, setStatus] = useState<TypeStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    const query = `{
      ${STATUS_TYPES.map(
        (t) =>
          `"${t}": {"count": count(*[_type == "${t}" && !(_id in path("drafts.**"))]), "hasDraft": count(*[_type == "${t}" && _id in path("drafts.**")]) > 0}`
      ).join(',\n')}
    }`
    client
      .fetch<TypeStatus>(query)
      .then((result) => {
        if (!cancelled) setStatus(result)
      })
      .catch(() => {
        // Offline or query failure — rows just render without a badge.
      })
    return () => {
      cancelled = true
    }
  }, [client])

  return status
}

export function combineStatus(status: TypeStatus | null, types: StatusType[]): {count: number; hasDraft: boolean} | null {
  if (!status) return null
  let count = 0
  let hasDraft = false
  for (const type of types) {
    const entry = status[type]
    if (!entry) continue
    count += entry.count
    hasDraft = hasDraft || entry.hasDraft
  }
  return {count, hasDraft}
}
