import type { DustMote, Wisp, WispDepth } from './wispTypes'

function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r},${g},${b},${a})`
}

/** Soft circular mote: bright core + feathered rim (not a ribbon / smoke sheet). */
function drawMote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  opacity: number,
) {
  if (opacity < 0.02 || radius < 0.4) return

  const glowR = radius * 2.2
  const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR)
  glow.addColorStop(0, hexToRgba(color, opacity * 0.55))
  glow.addColorStop(0.45, hexToRgba(color, opacity * 0.22))
  glow.addColorStop(1, hexToRgba(color, 0))
  ctx.beginPath()
  ctx.arc(x, y, glowR, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.fill()

  const core = ctx.createRadialGradient(x, y, 0, x, y, radius)
  core.addColorStop(0, hexToRgba('#FFF8F0', opacity * 0.9))
  core.addColorStop(0.35, hexToRgba(color, opacity * 0.75))
  core.addColorStop(1, hexToRgba(color, 0))
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = core
  ctx.fill()
}

function drawWisp(ctx: CanvasRenderingContext2D, w: Wisp) {
  drawMote(ctx, w.pos.x, w.pos.y, w.baseWidth, w.color, w.opacity)
}

function drawDust(ctx: CanvasRenderingContext2D, dust: DustMote[]) {
  for (const d of dust) {
    drawMote(ctx, d.pos.x, d.pos.y, d.size, d.color, d.opacity)
  }
}

const DEPTH_ORDER: WispDepth[] = ['back', 'mid', 'fore']

export function renderWisps(
  ctx: CanvasRenderingContext2D,
  wisps: Wisp[],
  dust: DustMote[],
  cssW: number,
  cssH: number,
  dpr: number,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)

  const sx = cssW / 2560
  const sy = cssH / 1440
  ctx.scale(sx, sy)
  ctx.globalCompositeOperation = 'source-over'

  for (const depth of DEPTH_ORDER) {
    for (const w of wisps) {
      if (w.depth === depth) drawWisp(ctx, w)
    }
  }

  drawDust(ctx, dust)
}
