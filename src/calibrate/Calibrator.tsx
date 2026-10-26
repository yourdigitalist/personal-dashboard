import { useEffect, useMemo, useRef, useState } from 'react'
import { glassPanel } from '../chrome/glass'
import type { LightPoint, RectRegion } from '../scene/sceneMap'
import { useCalibration } from './CalibrationContext'

type Mode =
  | { type: 'light'; id: string }
  | { type: 'mug' }
  | { type: 'dog' }
  | { type: 'hotspot'; id: string }

type CornerDraft = { x: number; y: number } | null

function pctFromClient(
  clientX: number,
  clientY: number,
  el: HTMLElement,
): { x: number; y: number } {
  const rect = el.getBoundingClientRect()
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  }
}

function cornersToRect(
  a: { x: number; y: number },
  b: { x: number; y: number },
): RectRegion {
  const left = Math.min(a.x, b.x)
  const top = Math.min(a.y, b.y)
  return {
    left,
    top,
    width: Math.max(0.5, Math.abs(b.x - a.x)),
    height: Math.max(0.5, Math.abs(b.y - a.y)),
  }
}

function clampRect(rect: RectRegion): RectRegion {
  const left = Math.min(99, Math.max(0, rect.left))
  const top = Math.min(99, Math.max(0, rect.top))
  return {
    left,
    top,
    width: Math.min(100 - left, Math.max(0.5, rect.width)),
    height: Math.min(100 - top, Math.max(0.5, rect.height)),
  }
}

export function Calibrator() {
  const { map, setMap, resetMap, calibrate, setCalibrate } = useCalibration()
  const stageRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>({ type: 'dog' })
  const [corner, setCorner] = useState<CornerDraft>(null)
  const [redraw, setRedraw] = useState(false)
  const [status, setStatus] = useState(
    'Drag boxes to move. Drag the corner handle to resize. Drag lights to move.',
  )
  const [copied, setCopied] = useState(false)
  const [panelPos, setPanelPos] = useState({ x: 24, y: 120 })

  const modeLabel = useMemo(() => {
    if (mode.type === 'mug') return 'Mug steam'
    if (mode.type === 'dog') return 'Dog lungs'
    if (mode.type === 'light') {
      return map.lights.find((l) => l.id === mode.id)?.label ?? mode.id
    }
    return map.hotspots.find((h) => h.id === mode.id)?.name ?? mode.id
  }, [mode, map])

  useEffect(() => {
    if (!calibrate) return
    setStatus(
      'Drag boxes to move · corner handle to resize · lights: drag + scroll to size',
    )
  }, [calibrate])

  if (!calibrate) return null

  function setMug(next: RectRegion) {
    setMap((prev) => ({ ...prev, mugSteam: clampRect(next) }))
  }

  function setDog(next: RectRegion) {
    setMap((prev) => ({ ...prev, dogLungs: clampRect(next) }))
  }

  function setHotspot(id: string, next: RectRegion) {
    const rect = clampRect(next)
    setMap((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((h) => (h.id === id ? { ...h, ...rect } : h)),
    }))
  }

  function updateLight(id: string, patch: Partial<LightPoint>) {
    setMap((prev) => ({
      ...prev,
      lights: prev.lights.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }))
  }

  function onStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!redraw) return
    if ((event.target as HTMLElement).closest('[data-marker]')) return
    const stage = stageRef.current
    if (!stage) return
    const point = pctFromClient(event.clientX, event.clientY, stage)

    if (mode.type === 'light') {
      updateLight(mode.id, { left: point.x, top: point.y })
      setStatus(`${modeLabel}: placed — drag or scroll to refine`)
      setRedraw(false)
      return
    }

    if (!corner) {
      setCorner(point)
      setStatus(`${modeLabel}: corner 1 — click opposite corner`)
      return
    }

    const rect = cornersToRect(corner, point)
    if (mode.type === 'mug') setMug(rect)
    else if (mode.type === 'dog') setDog(rect)
    else if (mode.type === 'hotspot') setHotspot(mode.id, rect)
    setCorner(null)
    setRedraw(false)
    setStatus(`${modeLabel}: redrawn`)
  }

  function onPanelDragStart(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button, select, input, a')) return
    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const origin = { ...panelPos }

    const onMove = (e: PointerEvent) => {
      setPanelPos({
        x: Math.max(8, origin.x + (e.clientX - startX)),
        y: Math.max(8, origin.y + (e.clientY - startY)),
      })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(map, null, 2))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const activeRect =
    mode.type === 'mug'
      ? map.mugSteam
      : mode.type === 'dog'
        ? map.dogLungs
        : mode.type === 'hotspot'
          ? map.hotspots.find((h) => h.id === mode.id)
          : null

  return (
    <>
      <div
        ref={stageRef}
        className={`absolute inset-0 z-[60] ${redraw ? 'cursor-crosshair' : ''}`}
        onPointerDown={onStagePointerDown}
      >
        {map.lights.map((light) => (
          <LightMarker
            key={light.id}
            light={light}
            active={mode.type === 'light' && mode.id === light.id}
            stageRef={stageRef}
            onSelect={() => {
              setMode({ type: 'light', id: light.id })
              setCorner(null)
              setRedraw(false)
              setStatus(`${light.label}: drag to move, scroll to resize`)
            }}
            onMove={(left, top) => updateLight(light.id, { left, top })}
            onResize={(size) => updateLight(light.id, { size })}
          />
        ))}

        <RectMarker
          rect={map.mugSteam}
          label="Steam"
          color="#7dd3fc"
          active={mode.type === 'mug'}
          stageRef={stageRef}
          onSelect={() => {
            setMode({ type: 'mug' })
            setCorner(null)
            setRedraw(false)
            setStatus('Mug steam: drag to move, corner handle to resize')
          }}
          onChange={setMug}
        />
        <RectMarker
          rect={map.dogLungs}
          label="Lungs"
          color="#f9a8d4"
          active={mode.type === 'dog'}
          round
          faint
          stageRef={stageRef}
          onSelect={() => {
            setMode({ type: 'dog' })
            setCorner(null)
            setRedraw(false)
            setStatus('Dog lungs: drag to move, corner handle to resize — watch the circular pulse')
          }}
          onChange={setDog}
        />
        {map.hotspots.map((h) => (
          <RectMarker
            key={h.id}
            rect={h}
            label={h.name}
            color="#fde68a"
            active={mode.type === 'hotspot' && mode.id === h.id}
            stageRef={stageRef}
            onSelect={() => {
              setMode({ type: 'hotspot', id: h.id })
              setCorner(null)
              setRedraw(false)
              setStatus(`${h.name}: drag to move, corner handle to resize`)
            }}
            onChange={(rect) => setHotspot(h.id, rect)}
          />
        ))}

        {corner && (
          <span
            className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-window-pink"
            style={{ left: `${corner.x}%`, top: `${corner.y}%` }}
          />
        )}
      </div>

      {/* Draggable control panel */}
      <div
        className={`pointer-events-auto fixed z-[70] max-h-[46vh] w-[min(92vw,28rem)] overflow-auto rounded-md p-3 text-plum-ink ${glassPanel}`}
        style={{ left: panelPos.x, top: panelPos.y }}
      >
        <div
          className="mb-2 flex cursor-grab items-center justify-between gap-2 active:cursor-grabbing"
          onPointerDown={onPanelDragStart}
        >
          <p className="font-display text-[9px] text-plum">Calibrator</p>
          <span className="text-[10px] text-mauve">drag panel</span>
          <button
            type="button"
            className="rounded-md border-2 border-plum/25 bg-cream-soft px-2 py-1 text-xs text-plum hover:bg-blush/40"
            onClick={() => setCalibrate(false)}
          >
            Close
          </button>
        </div>

        <p className="mb-2 text-[11px] text-plum-ink/80">{status}</p>
        <p className="mb-2 text-[11px] text-mauve">
          Edit in place: drag markers. Use <strong>Redraw</strong> only to set two new corners.
        </p>

        <Section title="FX">
          <Chip
            active={mode.type === 'dog'}
            onClick={() => {
              setMode({ type: 'dog' })
              setCorner(null)
              setRedraw(false)
            }}
          >
            Dog lungs
          </Chip>
          <Chip
            active={mode.type === 'mug'}
            onClick={() => {
              setMode({ type: 'mug' })
              setCorner(null)
              setRedraw(false)
            }}
          >
            Mug steam
          </Chip>
          {map.lights.map((l) => (
            <Chip
              key={l.id}
              active={mode.type === 'light' && mode.id === l.id}
              onClick={() => {
                setMode({ type: 'light', id: l.id })
                setCorner(null)
                setRedraw(false)
              }}
            >
              {l.label}
            </Chip>
          ))}
        </Section>

        <Section title="Clicks">
          {map.hotspots.map((h) => (
            <Chip
              key={h.id}
              active={mode.type === 'hotspot' && mode.id === h.id}
              onClick={() => {
                setMode({ type: 'hotspot', id: h.id })
                setCorner(null)
                setRedraw(false)
              }}
            >
              {h.name}
            </Chip>
          ))}
        </Section>

        {activeRect && mode.type !== 'light' && (
          <div className="mb-2 grid grid-cols-4 gap-1 text-[10px] text-mauve">
            <span>L {activeRect.left.toFixed(1)}</span>
            <span>T {activeRect.top.toFixed(1)}</span>
            <span>W {activeRect.width.toFixed(1)}</span>
            <span>H {activeRect.height.toFixed(1)}</span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs ${
              redraw
                ? 'bg-window-pink text-plum-ink'
                : 'border-2 border-plum/25 bg-cream-soft text-plum hover:bg-blush/40'
            }`}
            onClick={() => {
              setRedraw((v) => !v)
              setCorner(null)
              setStatus(
                redraw
                  ? 'Edit mode: drag markers'
                  : 'Redraw mode: click two opposite corners on the room',
              )
            }}
          >
            {redraw ? 'Cancel redraw' : 'Redraw (2 clicks)'}
          </button>
          <button
            type="button"
            className="rounded-lg bg-window-pink px-3 py-1.5 text-xs font-medium text-plum-ink"
            onClick={() => void copyJson()}
          >
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
          <button
            type="button"
            className="rounded-md border-2 border-plum/25 bg-cream-soft px-3 py-1.5 text-xs text-plum hover:bg-blush/40"
            onClick={() => {
              setMap((prev) => ({
                ...prev,
                dogLungs: {
                  left: 36,
                  top: 68,
                  width: 11,
                  height: 9,
                },
                hotspots: prev.hotspots.some((h) => h.id === 'louie')
                  ? prev.hotspots
                  : [
                      ...prev.hotspots,
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
                    ],
              }))
              setMode({ type: 'dog' })
              setStatus('Louie lungs + click target restored — drag into place')
            }}
          >
            Restore Louie
          </button>
          <button
            type="button"
            className="rounded-md border-2 border-plum/25 bg-cream-soft px-3 py-1.5 text-xs text-plum hover:bg-blush/40"
            onClick={() => {
              resetMap()
              setCorner(null)
              setRedraw(false)
              setStatus('Reset to defaults')
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-2">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-mauve">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border-2 px-2.5 py-1 text-[11px] transition ${
        active
          ? 'border-plum bg-plum text-cream'
          : 'border-plum/25 bg-cream-soft text-plum hover:bg-blush/40'
      }`}
    >
      {children}
    </button>
  )
}

function RectMarker({
  rect,
  label,
  color,
  active,
  stageRef,
  onSelect,
  onChange,
  round = false,
  faint = false,
}: {
  rect: RectRegion
  label: string
  color: string
  active: boolean
  stageRef: React.RefObject<HTMLDivElement | null>
  onSelect: () => void
  onChange: (rect: RectRegion) => void
  /** Elliptical marker (for lungs) */
  round?: boolean
  /** Very light fill so the live FX stays visible underneath */
  faint?: boolean
}) {
  function startMove(event: React.PointerEvent) {
    event.stopPropagation()
    event.preventDefault()
    onSelect()
    const stage = stageRef.current
    if (!stage) return
    const start = pctFromClient(event.clientX, event.clientY, stage)
    const origin = { ...rect }

    const onMove = (e: PointerEvent) => {
      const now = pctFromClient(e.clientX, e.clientY, stage)
      onChange(
        clampRect({
          left: origin.left + (now.x - start.x),
          top: origin.top + (now.y - start.y),
          width: origin.width,
          height: origin.height,
        }),
      )
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function startResize(event: React.PointerEvent) {
    event.stopPropagation()
    event.preventDefault()
    onSelect()
    const stage = stageRef.current
    if (!stage) return
    const start = pctFromClient(event.clientX, event.clientY, stage)
    const origin = { ...rect }

    const onMove = (e: PointerEvent) => {
      const now = pctFromClient(e.clientX, e.clientY, stage)
      onChange(
        clampRect({
          left: origin.left,
          top: origin.top,
          width: origin.width + (now.x - start.x),
          height: origin.height + (now.y - start.y),
        }),
      )
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      data-marker
      className={`pointer-events-auto absolute border-2 ${round ? 'rounded-full' : 'rounded-md'}`}
      style={{
        left: `${rect.left}%`,
        top: `${rect.top}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
        borderColor: color,
        background: faint
          ? active
            ? `${color}18`
            : `${color}0a`
          : active
            ? `${color}44`
            : `${color}22`,
        boxShadow: active ? `0 0 0 1px ${color}` : undefined,
        cursor: 'move',
        zIndex: active ? 5 : 1,
      }}
      onPointerDown={startMove}
    >
      <span
        className="pointer-events-none absolute -top-5 left-0 rounded px-1 text-[10px] font-medium text-plum-ink"
        style={{ background: color }}
      >
        {label}
      </span>
      <button
        type="button"
        aria-label={`Resize ${label}`}
        className="absolute right-0 bottom-0 size-3 translate-x-1/3 translate-y-1/3 cursor-se-resize rounded-sm border border-plum-ink/40 bg-cream"
        style={{ background: color }}
        onPointerDown={startResize}
      />
    </div>
  )
}

function LightMarker({
  light,
  active,
  stageRef,
  onSelect,
  onMove,
  onResize,
}: {
  light: LightPoint
  active: boolean
  stageRef: React.RefObject<HTMLDivElement | null>
  onSelect: () => void
  onMove: (left: number, top: number) => void
  onResize: (size: number) => void
}) {
  function startMove(event: React.PointerEvent) {
    event.stopPropagation()
    event.preventDefault()
    onSelect()
    const stage = stageRef.current
    if (!stage) return

    const onMovePtr = (e: PointerEvent) => {
      const now = pctFromClient(e.clientX, e.clientY, stage)
      onMove(
        Math.min(100, Math.max(0, now.x)),
        Math.min(100, Math.max(0, now.y)),
      )
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMovePtr)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMovePtr)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      data-marker
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border active:cursor-grabbing"
      style={{
        left: `${light.left}%`,
        top: `${light.top}%`,
        width: `${light.size}%`,
        aspectRatio: '1',
        borderColor: active ? '#fff' : 'rgba(255,200,120,0.85)',
        background:
          light.kind === 'candle'
            ? 'radial-gradient(circle, rgba(255,160,80,0.55), transparent 70%)'
            : 'radial-gradient(circle, rgba(255,210,140,0.5), transparent 70%)',
        zIndex: active ? 5 : 1,
      }}
      onPointerDown={startMove}
      onWheel={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onSelect()
        const delta = e.deltaY > 0 ? -0.8 : 0.8
        onResize(Math.min(28, Math.max(3, light.size + delta)))
      }}
    >
      <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-plum-deep/80 px-1 text-[9px] text-cream">
        {light.label}
      </span>
    </div>
  )
}
