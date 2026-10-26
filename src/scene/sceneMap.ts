import type { AppId } from '../types'

export type RectRegion = {
  left: number
  top: number
  width: number
  height: number
}

export type LightPoint = {
  id: string
  label: string
  kind: 'lamp' | 'candle' | 'orb'
  left: number
  top: number
  /** Glow diameter as % of stage width */
  size: number
}

export type HotspotMap = {
  id: string
  name: string
  label: string
  appId: AppId
  chip?: 'top' | 'bottom' | 'center'
} & RectRegion

export type SceneMap = {
  version: 1
  lights: LightPoint[]
  mugSteam: RectRegion
  dogLungs: RectRegion
  hotspots: HotspotMap[]
}

/** Starter guesses for the Magnific morning/afternoon/evening room. Refine with ?calibrate=1 */
export const DEFAULT_SCENE_MAP: SceneMap = {
  version: 1,
  lights: [
    { id: 'desk-lamp', label: 'Desk lamp', kind: 'lamp', left: 42, top: 40, size: 14 },
    { id: 'shelf-orb', label: 'Shelf orb', kind: 'orb', left: 12, top: 29, size: 9 },
    { id: 'mushroom', label: 'Mushroom lamp', kind: 'lamp', left: 24, top: 48, size: 10 },
    { id: 'bedside', label: 'Bedside orb', kind: 'orb', left: 79, top: 49, size: 11 },
    { id: 'candle-left', label: 'Candle (left)', kind: 'candle', left: 22.5, top: 64, size: 7 },
    { id: 'candle-right', label: 'Candle (right)', kind: 'candle', left: 88, top: 80, size: 8 },
    { id: 'jar-right', label: 'Jar glow', kind: 'candle', left: 93, top: 72, size: 7 },
  ],
  mugSteam: { left: 45.5, top: 44, width: 3.5, height: 9 },
  dogLungs: { left: 36, top: 68, width: 11, height: 9 },
  hotspots: [
    {
      id: 'monitor',
      name: 'Claude',
      label: 'Open Claude',
      appId: 'claude',
      left: 44,
      top: 38,
      width: 10,
      height: 12,
      chip: 'top',
    },
    {
      id: 'calendar',
      name: 'Calendar',
      label: 'Open Calendar',
      appId: 'calendar',
      left: 26,
      top: 22,
      width: 5.5,
      height: 14,
      chip: 'bottom',
    },
    {
      id: 'projects',
      name: 'Projects',
      label: 'Open Projects',
      appId: 'projects',
      left: 82,
      top: 18,
      width: 10,
      height: 16,
      chip: 'bottom',
    },
    {
      id: 'louie',
      name: 'Louie',
      label: 'Pet Louie',
      appId: 'louie',
      left: 32,
      top: 62,
      width: 17,
      height: 20,
      chip: 'top',
    },
    {
      id: 'bookshelf',
      name: 'Library',
      label: 'Open Library',
      appId: 'library',
      left: 1.5,
      top: 12,
      width: 13,
      height: 55,
      chip: 'center',
    },
    {
      id: 'mug',
      name: 'Daily note',
      label: 'Daily motivation',
      appId: 'motivation',
      left: 45,
      top: 48,
      width: 3.5,
      height: 5.5,
      chip: 'top',
    },
    {
      id: 'lamp',
      name: 'Focus',
      label: 'Open Focus timer',
      appId: 'focus',
      left: 40,
      top: 36,
      width: 5,
      height: 14,
      chip: 'top',
    },
    {
      id: 'tasks',
      name: 'Tasks',
      label: 'Open Tasks',
      appId: 'tasks',
      left: 48,
      top: 52,
      width: 5,
      height: 5,
      chip: 'top',
    },
  ],
}

export const SCENE_MAP_STORAGE_KEY = 'mlc-scene-map-v1'
