'use client'

import {PanelLeftIcon} from '@sanity/icons'
import type {CSSProperties} from 'react'
import {useState} from 'react'
import {ToolLink, useWorkspace} from 'sanity'
import {Link, useRouterState} from 'sanity/router'

import {CONTENT_GROUPS, GROUPED_TOOL_NAMES} from './contentGroups'
import {combineStatus, useTypeStatus} from './useTypeStatus'

const EXPANDED_WIDTH = 220
const COLLAPSED_WIDTH = 64

function rowStyle(isActive: boolean, collapsed: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 500,
    color: 'var(--card-fg-color, #101112)',
    background: isActive ? 'var(--card-muted-bg-color, #e5e7eb)' : 'transparent',
    transition: 'background 0.15s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
  }
}

export function ToolRail() {
  const {tools} = useWorkspace()
  const activeToolName = useRouterState((state) => (typeof state?.tool === 'string' ? state.tool : undefined))
  const activePreviewPath = useRouterState((state) => {
    const presentationState = state?.presentation as {preview?: string} | undefined
    return presentationState?.preview
  })
  const [collapsed, setCollapsed] = useState(false)
  const typeStatus = useTypeStatus()

  const toolsByName = new Map(tools.map((tool) => [tool.name, tool]))
  const ungroupedTools = tools.filter((tool) => !GROUPED_TOOL_NAMES.has(tool.name))

  return (
    <nav
      style={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        borderRight: '1px solid var(--card-border-color, #e5e7eb)',
        background: 'var(--card-bg-color, #fff)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        transition: 'width 0.15s ease',
      }}
    >
      {/* Brand header */}
      <div
        style={{
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: '0.5rem',
          padding: collapsed ? '0.75rem 0.4rem' : '0.75rem 0.6rem',
          borderBottom: '1px solid var(--card-border-color, #e5e7eb)',
        }}
      >
        <img src="/RR-logo.svg" alt="Regatta Registers" style={{height: '26px', width: 'auto', flexShrink: 0}} />
        {!collapsed && (
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--card-fg-color, #101112)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Regatta Registers
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            marginLeft: collapsed ? '0' : 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            flexShrink: 0,
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--muted-fg-color, #6b7280)',
            cursor: 'pointer',
            fontSize: '22px',
          }}
        >
          <PanelLeftIcon />
        </button>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '2px', padding: '0.6rem'}}>
        {/* Core tools: Home, Analytics, Vision, Releases, User Behavior, ... */}
        {ungroupedTools.map((tool) => {
          const isActive = tool.name === activeToolName
          const Icon = tool.icon
          return (
            <ToolLink
              key={tool.name}
              name={tool.name}
              title={collapsed ? tool.title ?? tool.name : undefined}
              style={rowStyle(isActive, collapsed)}
            >
              <span style={{fontSize: '20px', display: 'flex', flexShrink: 0}}>{Icon && <Icon />}</span>
              {!collapsed && (
                <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                  {tool.title ?? tool.name}
                </span>
              )}
            </ToolLink>
          )
        })}

        {/* Flattened content groups */}
        {CONTENT_GROUPS.map((group) => (
          <div key={group.title} style={{marginTop: '0.5rem'}}>
            {!collapsed && (
              <div
                style={{
                  padding: '0.5rem 0.75rem 0.35rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--muted-fg-color, #9ca3af)',
                }}
              >
                {group.title}
              </div>
            )}
            {group.rows.map((row) => {
              const tool = toolsByName.get(row.toolName)
              if (!tool) return null
              const Icon = tool.icon
              const combined = combineStatus(typeStatus, row.types)
              const rowLabel = (
                <>
                  <span style={{fontSize: '20px', display: 'flex', flexShrink: 0}}>{Icon && <Icon />}</span>
                  {!collapsed && (
                    <>
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tool.title ?? tool.name}
                      </span>
                      {combined && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.75rem',
                            color: 'var(--muted-fg-color, #6b7280)',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: combined.hasDraft ? '#f59e0b' : '#16a34a',
                              display: 'inline-block',
                            }}
                          />
                          {combined.count}
                        </span>
                      )}
                    </>
                  )}
                </>
              )

              // Marketing pages jump straight into the Presentation ("Preview")
              // tool at their frontend route instead of the plain form editor.
              if (row.previewPath) {
                const isActive = activeToolName === 'presentation' && activePreviewPath === row.previewPath
                const isActiveCo =
                  activeToolName === 'presentation' && row.previewPathCo && activePreviewPath === row.previewPathCo
                return (
                  <div key={tool.name} style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
                    <Link
                      href={`/studio/presentation?preview=${encodeURIComponent(row.previewPath)}`}
                      title={collapsed ? tool.title ?? tool.name : undefined}
                      style={{...rowStyle(isActive, collapsed), flex: 1, minWidth: 0}}
                    >
                      {rowLabel}
                    </Link>
                    {!collapsed && row.previewPathCo && (
                      <Link
                        href={`/studio/presentation?preview=${encodeURIComponent(row.previewPathCo)}`}
                        title="Edit Colombia (Spanish) version"
                        style={{
                          flexShrink: 0,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.3rem 0.4rem',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          color: isActiveCo ? 'var(--card-fg-color, #101112)' : 'var(--muted-fg-color, #9ca3af)',
                          background: isActiveCo ? 'var(--card-muted-bg-color, #e5e7eb)' : 'transparent',
                        }}
                      >
                        CO
                      </Link>
                    )}
                  </div>
                )
              }

              const isActive = tool.name === activeToolName
              return (
                <ToolLink
                  key={tool.name}
                  name={tool.name}
                  title={collapsed ? tool.title ?? tool.name : undefined}
                  style={rowStyle(isActive, collapsed)}
                >
                  {rowLabel}
                </ToolLink>
              )
            })}
          </div>
        ))}
      </div>
    </nav>
  )
}
