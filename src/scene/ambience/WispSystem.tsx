import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useTimeOfDay'
import { FIELD_VERSION, themeForTimeOfDay } from '../../lib/ambience/wispConfig'
import { createWispField, recolorField } from '../../lib/ambience/wispFactory'
import { stepDust, stepWisps } from '../../lib/ambience/wispPhysics'
import { renderWisps } from '../../lib/ambience/wispRenderer'
import type { DustMote, Wisp, WispTheme } from '../../lib/ambience/wispTypes'
import type { TimeOfDay } from '../../types'

type Props = {
  timeOfDay: TimeOfDay
}

type SizeState = { cssW: number; cssH: number; dpr: number }

/**
 * Canvas 2D ambient ribbons — ambient drift only (no mouse interaction yet).
 * pointer-events: none so hotspots / UI stay fully clickable.
 */
export function WispSystem({ timeOfDay }: Props) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wispsRef = useRef<Wisp[]>([])
  const dustRef = useRef<DustMote[]>([])
  const themeRef = useRef<WispTheme>(themeForTimeOfDay(timeOfDay))
  const timeRef = useRef(0)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const sizeRef = useRef<SizeState>({ cssW: 1, cssH: 1, dpr: 1 })
  const versionRef = useRef(0)

  useEffect(() => {
    const theme = themeForTimeOfDay(timeOfDay)
    themeRef.current = theme
    if (wispsRef.current.length === 0 || versionRef.current !== FIELD_VERSION) {
      const field = createWispField(theme)
      wispsRef.current = field.wisps
      dustRef.current = field.dust
      versionRef.current = field.version
    } else {
      recolorField(wispsRef.current, dustRef.current, theme)
    }
  }, [timeOfDay])

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cssW = Math.max(1, Math.floor(rect.width))
      const cssH = Math.max(1, Math.floor(rect.height))
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      sizeRef.current = { cssW, cssH, dpr }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    const onVisibility = () => {
      if (document.hidden) lastRef.current = 0
    }
    document.addEventListener('visibilitychange', onVisibility)

    if (wispsRef.current.length === 0) {
      const field = createWispField(themeRef.current)
      wispsRef.current = field.wisps
      dustRef.current = field.dust
    }

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick)
      if (document.hidden) return

      const last = lastRef.current || now
      let dt = (now - last) / 1000
      lastRef.current = now
      if (dt > 0.05) dt = 0.05

      timeRef.current += dt
      const theme = themeRef.current
      stepWisps(wispsRef.current, dt, timeRef.current, theme)
      stepDust(dustRef.current, dt, timeRef.current, theme)

      const { cssW, cssH, dpr } = sizeRef.current
      renderWisps(ctx, wispsRef.current, dustRef.current, cssW, cssH, dpr)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden
    />
  )
}
