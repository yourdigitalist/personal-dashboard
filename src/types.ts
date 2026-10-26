export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export type LightingMode = 'auto' | TimeOfDay

export type AppId =
  | 'claude'
  | 'calendar'
  | 'tasks'
  | 'projects'
  | 'library'
  | 'focus'
  | 'motivation'
  | 'music'
  | 'settings'
  | 'louie'

export type WindowState = {
  id: AppId
  title: string
  open: boolean
  minimized: boolean
  maximized: boolean
  zIndex: number
  x: number
  y: number
  width: number
  height: number
}

export type HotspotDef = {
  id: string
  /** Accessible name, e.g. "Open Claude" */
  label: string
  /** Short chip label shown on hover, e.g. "Claude" */
  name: string
  appId: AppId
  left: number
  top: number
  width: number
  height: number
  /** Where the hover chip sits relative to the hit box */
  chip?: 'top' | 'bottom' | 'center'
}
