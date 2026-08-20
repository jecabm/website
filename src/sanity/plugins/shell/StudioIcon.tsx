'use client'

/**
 * Renders the Regatta Registers mark in place of Sanity's default studio
 * icon — shown in the workspace badge on the login screen and workspace switcher.
 */
export function StudioIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/RR-logo.svg" alt="Regatta Registers" style={{height: '70%', width: '70%', objectFit: 'contain'}} />
  )
}
