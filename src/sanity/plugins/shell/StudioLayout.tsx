'use client'

import type {LayoutProps} from 'sanity'

import {ToolRail} from './ToolRail'

/**
 * Renders the tool switcher as a left-hand rail instead of Studio's default
 * top tab strip (which is suppressed via `HiddenToolMenu`).
 */
export function StudioLayout(props: LayoutProps) {
  return (
    <div style={{display: 'flex', height: '100%', width: '100%'}}>
      <ToolRail />
      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
        {props.renderDefault(props)}
      </div>
    </div>
  )
}
