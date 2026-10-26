import {
  DUST_COUNT,
  FIELD_VERSION,
  LAYER_CONFIG,
  ORANGE_DUST_COLORS,
  ORANGE_DUST_COUNT,
  SCENE_H,
  SCENE_W,
  SPAWN_REGIONS,
  colorsForTheme,
} from './wispConfig'
import type {
  DustKind,
  DustMote,
  Vec2,
  Wisp,
  WispDepth,
  WispTheme,
} from './wispTypes'

let nextId = 1

function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function pickRegion(depth: WispDepth, seed: number) {
  const regions = SPAWN_REGIONS.filter((r) => r.depth === depth)
  const list = regions.length ? regions : SPAWN_REGIONS
  const total = list.reduce((s, r) => s + r.weight, 0)
  let t = rand(seed) * total
  for (const r of list) {
    t -= r.weight
    if (t <= 0) return r
  }
  return list[list.length - 1]
}

function pointInRegion(
  region: { x0: number; y0: number; x1: number; y1: number },
  seed: number,
): Vec2 {
  return {
    x: lerp(region.x0, region.x1, rand(seed + 1)),
    y: lerp(region.y0, region.y1, rand(seed + 2)),
  }
}

export function createWisp(depth: WispDepth, theme: WispTheme, seed: number): Wisp {
  const cfg = LAYER_CONFIG[depth]
  const colors = colorsForTheme(theme)
  const region = pickRegion(depth, seed)
  const home = pointInRegion(region, seed + 3)
  const angle = lerp(0, Math.PI * 2, rand(seed + 4))
  const speed = lerp(cfg.speedMin, cfg.speedMax, rand(seed + 6))
  const radius = lerp(cfg.radiusMin, cfg.radiusMax, rand(seed + 8))
  const lifespan = lerp(18, 40, rand(seed + 7))

  return {
    id: nextId++,
    depth,
    home: { ...home },
    pos: { ...home },
    vel: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed * 0.55,
    },
    length: radius * 2,
    baseWidth: radius,
    opacity: 0,
    targetOpacity: lerp(cfg.opacityMin, cfg.opacityMax, rand(seed + 10)),
    color: colors[Math.floor(rand(seed + 11) * colors.length) % colors.length],
    phase: rand(seed + 12) * Math.PI * 2,
    oscAmp: lerp(cfg.oscAmpMin, cfg.oscAmpMax, rand(seed + 13)),
    oscFreq: lerp(0.06, 0.14, rand(seed + 14)),
    drift: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed * 0.55,
    },
    rot: 0,
    rotSpeed: 0,
    curve: 0,
    age: 0,
    lifespan,
    seed,
  }
}

export function createDust(
  theme: WispTheme,
  seed: number,
  kind: DustKind = 'pastel',
): DustMote {
  const colors = kind === 'orange' ? ORANGE_DUST_COLORS : colorsForTheme(theme)
  // Full scene scatter
  const x = rand(seed) * SCENE_W
  const y = rand(seed + 1) * SCENE_H
  const slow = kind === 'orange'
  return {
    id: nextId++,
    kind,
    pos: { x, y },
    vel: {
      x: lerp(slow ? -3.5 : -5, slow ? 3.5 : 5, rand(seed + 2)),
      y: lerp(slow ? -6 : -8, slow ? -1 : -1.5, rand(seed + 3)),
    },
    size:
      kind === 'orange'
        ? lerp(1.2, 4.2, rand(seed + 4))
        : lerp(1.5, 3.5, rand(seed + 4)),
    opacity:
      kind === 'orange'
        ? lerp(0.22, 0.5, rand(seed + 5))
        : lerp(0.25, 0.55, rand(seed + 5)),
    color: colors[Math.floor(rand(seed + 6) * colors.length) % colors.length],
    phase: rand(seed + 7) * Math.PI * 2,
  }
}

export function createWispField(theme: WispTheme): {
  wisps: Wisp[]
  dust: DustMote[]
  version: number
} {
  const wisps: Wisp[] = []
  let seed = 42 + FIELD_VERSION * 100
  for (const depth of ['back', 'mid', 'fore'] as WispDepth[]) {
    const n = LAYER_CONFIG[depth].count
    for (let i = 0; i < n; i++) {
      wisps.push(createWisp(depth, theme, seed++))
    }
  }
  const dust: DustMote[] = [
    ...Array.from({ length: DUST_COUNT }, (_, i) =>
      createDust(theme, seed + i * 3, 'pastel'),
    ),
    ...Array.from({ length: ORANGE_DUST_COUNT }, (_, i) =>
      createDust(theme, seed + 900 + i * 3, 'orange'),
    ),
  ]
  return { wisps, dust, version: FIELD_VERSION }
}

export function recolorField(wisps: Wisp[], dust: DustMote[], theme: WispTheme) {
  const pastel = colorsForTheme(theme)
  for (const w of wisps) {
    w.color = pastel[Math.floor(rand(w.seed + 11) * pastel.length) % pastel.length]
  }
  for (const d of dust) {
    if (d.kind === 'orange') {
      d.color =
        ORANGE_DUST_COLORS[
          Math.floor(rand(d.id + 6) * ORANGE_DUST_COLORS.length) %
            ORANGE_DUST_COLORS.length
        ]
    } else {
      d.color = pastel[d.id % pastel.length]
    }
  }
}
