import { useEffect, useRef } from 'react'
import { useCalibration } from '../calibrate/CalibrationContext'
import { useScene } from '../context/SceneContext'
import { ROOM_PLATES } from './roomPlates'

/** Peak bulge amount (0–1). Photoshop-spherize style — meant to be clearly visible. */
const MAX_STRENGTH = 0.38
const BREATH_MS = 3600

/**
 * Photoshop-style bulge brush on dogLungs only.
 * Resamples that ellipse of the room plate; rim stays locked to the bg.
 */
export function LungsBulge() {
  const { timeOfDay } = useScene()
  const { map, calibrate } = useCalibration()
  const lungs = map.dogLungs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lungsRef = useRef(lungs)
  lungsRef.current = lungs

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const source = document.createElement('canvas')
    const sourceCtx = source.getContext('2d', { willReadFrequently: true })
    if (!sourceCtx) return

    const img = new Image()
    img.decoding = 'async'
    let ready = false
    let raf = 0
    let start = performance.now()
    let lastSrc = ''

    const paintSource = () => {
      if (!ready) return
      sourceCtx.clearRect(0, 0, source.width, source.height)
      sourceCtx.drawImage(img, 0, 0, source.width, source.height)
    }

    const syncSize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cssW = Math.max(1, Math.floor(rect.width))
      const cssH = Math.max(1, Math.floor(rect.height))
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      source.width = canvas.width
      source.height = canvas.height
      paintSource()
    }

    img.onload = () => {
      ready = true
      syncSize()
    }
    const src = ROOM_PLATES[timeOfDay]
    if (src !== lastSrc) {
      lastSrc = src
      ready = false
      img.src = src
    }

    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(parent)

    const sample = (
      data: Uint8ClampedArray,
      bw: number,
      bh: number,
      lx: number,
      ly: number,
      channel: number,
    ) => {
      const x_ = Math.max(0, Math.min(bw - 1.001, lx))
      const y_ = Math.max(0, Math.min(bh - 1.001, ly))
      const x0i = Math.floor(x_)
      const y0i = Math.floor(y_)
      const x1i = Math.min(bw - 1, x0i + 1)
      const y1i = Math.min(bh - 1, y0i + 1)
      const fx = x_ - x0i
      const fy = y_ - y0i
      const i00 = (y0i * bw + x0i) * 4 + channel
      const i10 = (y0i * bw + x1i) * 4 + channel
      const i01 = (y1i * bw + x0i) * 4 + channel
      const i11 = (y1i * bw + x1i) * 4 + channel
      return (
        data[i00] * (1 - fx) * (1 - fy) +
        data[i10] * fx * (1 - fy) +
        data[i01] * (1 - fx) * fy +
        data[i11] * fx * fy
      )
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!ready || document.hidden) return

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const L = lungsRef.current
      const left = (L.left / 100) * w
      const top = (L.top / 100) * h
      const rw = Math.max(4, (L.width / 100) * w)
      const rh = Math.max(4, (L.height / 100) * h)
      const cx = left + rw / 2
      const cy = top + rh / 2
      const rx = rw * 0.5
      const ry = rh * 0.5

      // Smooth inhale / exhale
      const t = ((now - start) % BREATH_MS) / BREATH_MS
      const wave = 0.5 - 0.5 * Math.cos(t * Math.PI * 2)
      const strength = wave * MAX_STRENGTH

      // Pad bbox so spherize can pull samples from slightly outside the ellipse
      const pad = Math.ceil(Math.max(rx, ry) * MAX_STRENGTH + 2)
      const x0 = Math.max(0, Math.floor(cx - rx - pad))
      const y0 = Math.max(0, Math.floor(cy - ry - pad))
      const x1 = Math.min(w, Math.ceil(cx + rx + pad))
      const y1 = Math.min(h, Math.ceil(cy + ry + pad))
      const bw = x1 - x0
      const bh = y1 - y0
      if (bw < 2 || bh < 2) return

      const srcData = sourceCtx.getImageData(x0, y0, bw, bh)
      const out = ctx.createImageData(bw, bh)
      const s = srcData.data
      const d = out.data

      for (let py = 0; py < bh; py++) {
        for (let px = 0; px < bw; px++) {
          const x = x0 + px
          const y = y0 + py
          const nx = (x - cx) / rx
          const ny = (y - cy) / ry
          const dist = Math.hypot(nx, ny)
          const oi = (py * bw + px) * 4

          if (dist >= 1) {
            d[oi + 3] = 0
            continue
          }

          // Spherize / Photoshop bulge: push outward by sampling inward
          // r' = r * (1 - s*(1-r)^2)  in normalized space
          const bulge = 1 - strength * (1 - dist) * (1 - dist)
          const sx = cx + (x - cx) * bulge
          const sy = cy + (y - cy) * bulge

          d[oi] = sample(s, bw, bh, sx - x0, sy - y0, 0)
          d[oi + 1] = sample(s, bw, bh, sx - x0, sy - y0, 1)
          d[oi + 2] = sample(s, bw, bh, sx - x0, sy - y0, 2)

          // Soft brush edge (like a Photoshop brush hardness ~70%)
          const soft = dist > 0.78 ? 1 - (dist - 0.78) / 0.22 : 1
          d[oi + 3] = Math.round(255 * Math.max(0, soft))
        }
      }

      ctx.putImageData(out, x0, y0)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [timeOfDay])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[8]"
        aria-hidden
      />
      {calibrate && (
        <div
          className="pointer-events-none absolute z-[9] rounded-full border border-dashed border-pink-300/90"
          style={{
            left: `${lungs.left}%`,
            top: `${lungs.top}%`,
            width: `${lungs.width}%`,
            height: `${lungs.height}%`,
          }}
          aria-hidden
        />
      )}
    </>
  )
}
