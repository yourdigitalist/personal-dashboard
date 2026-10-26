import type { TimeOfDay } from '../../types'
import type { WispDepth, WispTheme } from './wispTypes'

export const SCENE_W = 2560
export const SCENE_H = 1440

/** Existing soft pastel motes */
export const WARM_COLORS = [
  '#FFF1DF',
  '#FFD9C7',
  '#F3C0D3',
  '#C9B5EE',
]

export const COOL_COLORS = [
  '#C9B5EE',
  '#B9A4D7',
  '#DCE1FF',
  '#FFF1DF',
]

/** Extra orange / amber dust layer (lamp-warm air) */
export const ORANGE_DUST_COLORS = [
  '#FFC078',
  '#FFB060',
  '#F0A050',
  '#FFD9A0',
  '#E8954A',
]

export type LayerConfig = {
  count: number
  opacityMin: number
  opacityMax: number
  radiusMin: number
  radiusMax: number
  speedMin: number
  speedMax: number
  oscAmpMin: number
  oscAmpMax: number
}

/** Soft circular dust motes across the full room. */
export const LAYER_CONFIG: Record<WispDepth, LayerConfig> = {
  back: {
    count: 22,
    opacityMin: 0.18,
    opacityMax: 0.38,
    radiusMin: 3,
    radiusMax: 7,
    speedMin: 3,
    speedMax: 8,
    oscAmpMin: 4,
    oscAmpMax: 12,
  },
  mid: {
    count: 32,
    opacityMin: 0.26,
    opacityMax: 0.52,
    radiusMin: 4,
    radiusMax: 10,
    speedMin: 5,
    speedMax: 12,
    oscAmpMin: 6,
    oscAmpMax: 16,
  },
  fore: {
    count: 16,
    opacityMin: 0.3,
    opacityMax: 0.58,
    radiusMin: 5,
    radiusMax: 11,
    speedMin: 4,
    speedMax: 10,
    oscAmpMin: 5,
    oscAmpMax: 14,
  },
}

/** Existing fine dust + denser orange layer */
export const DUST_COUNT = 48
export const ORANGE_DUST_COUNT = 55

/** Bump when particle counts/layout change so the runtime field recreates. */
export const FIELD_VERSION = 3

/** Full-scene coverage — every corner of the 2560×1440 plate. */
export const SPAWN_REGIONS: {
  depth: WispDepth
  x0: number
  y0: number
  x1: number
  y1: number
  weight: number
}[] = [
  // Full frame wash
  { depth: 'mid', x0: 40, y0: 40, x1: 2520, y1: 1400, weight: 5 },
  { depth: 'back', x0: 40, y0: 40, x1: 2520, y1: 700, weight: 3 },
  { depth: 'fore', x0: 40, y0: 600, x1: 2520, y1: 1400, weight: 3 },
  // Window / plants
  { depth: 'back', x0: 480, y0: 80, x1: 1680, y1: 620, weight: 2 },
  // Desk air
  { depth: 'mid', x0: 900, y0: 420, x1: 1400, y1: 820, weight: 1.5 },
  // Near Louie / rug
  { depth: 'mid', x0: 600, y0: 900, x1: 1400, y1: 1320, weight: 1.2 },
  // Bed / right side
  { depth: 'fore', x0: 1600, y0: 500, x1: 2480, y1: 1300, weight: 1.5 },
  // Bookshelf left
  { depth: 'back', x0: 40, y0: 120, x1: 420, y1: 1100, weight: 1.2 },
]

export function themeForTimeOfDay(tod: TimeOfDay): WispTheme {
  return tod === 'night' ? 'cool' : 'warm'
}

export function colorsForTheme(theme: WispTheme): string[] {
  return theme === 'cool' ? COOL_COLORS : WARM_COLORS
}
