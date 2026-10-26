import { SCENE_H, SCENE_W } from './wispConfig'
import { createDust, createWisp } from './wispFactory'
import type { DustMote, Wisp, WispTheme } from './wispTypes'

function wrapSoft(v: number, max: number, pad: number) {
  if (v < -pad) return max + pad
  if (v > max + pad) return -pad
  return v
}

function lifeFade(age: number, lifespan: number) {
  const fadeIn = 3
  const fadeOut = 4
  if (age < fadeIn) return age / fadeIn
  if (age > lifespan - fadeOut) return Math.max(0, (lifespan - age) / fadeOut)
  return 1
}

/** Lightweight curl-ish offset from seed + time. */
function flow(x: number, y: number, t: number, seed: number) {
  const a = Math.sin(x * 0.0011 + t * 0.11 + seed) * Math.cos(y * 0.0009 + t * 0.07)
  const b = Math.cos(x * 0.0008 - t * 0.09 + seed * 1.7) * Math.sin(y * 0.0013 + t * 0.05)
  return { x: a * 8, y: b * 6 }
}

export function stepWisps(wisps: Wisp[], dt: number, time: number, theme: WispTheme) {
  for (let i = 0; i < wisps.length; i++) {
    const w = wisps[i]
    w.age += dt

    if (w.age >= w.lifespan) {
      wisps[i] = createWisp(w.depth, theme, w.seed + Math.floor(time * 10) + i)
      continue
    }

    const osc = Math.sin(time * w.oscFreq * Math.PI * 2 + w.phase) * w.oscAmp
    const f = flow(w.pos.x, w.pos.y, time, w.seed)

    w.vel.x = w.drift.x + f.x * 0.15
    w.vel.y = w.drift.y + f.y * 0.15

    w.pos.x += w.vel.x * dt
    w.pos.y += w.vel.y * dt + (osc * dt) / Math.max(0.4, 1 / w.oscFreq)

    w.rot += w.rotSpeed * dt
    w.curve += Math.sin(time * 0.2 + w.phase) * 0.01 * dt

    const pad = w.baseWidth * 4
    w.pos.x = wrapSoft(w.pos.x, SCENE_W, pad)
    w.pos.y = wrapSoft(w.pos.y, SCENE_H, pad)

    w.opacity = w.targetOpacity * lifeFade(w.age, w.lifespan)
  }
}

export function stepDust(dust: DustMote[], dt: number, time: number, theme: WispTheme) {
  for (let i = 0; i < dust.length; i++) {
    const d = dust[i]
    d.pos.x += d.vel.x * dt + Math.sin(time * 0.4 + d.phase) * 2 * dt
    d.pos.y += d.vel.y * dt
    if (d.pos.y < -20 || d.pos.x < -40 || d.pos.x > SCENE_W + 40) {
      const kind = d.kind ?? 'pastel'
      dust[i] = createDust(theme, d.id + Math.floor(time * 3), kind)
      dust[i].pos.y = SCENE_H + 10
      dust[i].pos.x = Math.random() * SCENE_W
    }
  }
}
