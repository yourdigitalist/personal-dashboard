export type WispDepth = 'back' | 'mid' | 'fore'

export type WispTheme = 'warm' | 'cool'

export type DustKind = 'pastel' | 'orange'

export type Vec2 = { x: number; y: number }

/** Scene space is 2560 × 1440 (artwork native). */
export type Wisp = {
  id: number
  depth: WispDepth
  home: Vec2
  pos: Vec2
  vel: Vec2
  length: number
  baseWidth: number
  opacity: number
  targetOpacity: number
  color: string
  phase: number
  oscAmp: number
  oscFreq: number
  drift: Vec2
  rot: number
  rotSpeed: number
  curve: number
  age: number
  lifespan: number
  seed: number
}

export type DustMote = {
  id: number
  kind: DustKind
  pos: Vec2
  vel: Vec2
  size: number
  opacity: number
  color: string
  phase: number
}
