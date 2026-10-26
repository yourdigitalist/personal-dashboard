import { Maximize2, Minimize2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { usePrefersReducedMotion } from '../hooks/useTimeOfDay'
import type { WindowState } from '../types'
import { useWindows } from './WindowProvider'

type Props = {
  win: WindowState
  children: ReactNode
}

type DragState = {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
}

type ResizeState = {
  pointerId: number
  startX: number
  startY: number
  originW: number
  originH: number
}

export function FloatingWindow({ win, children }: Props) {
  const {
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
    moveWindow,
    resizeWindow,
  } = useWindows()
  const reduced = usePrefersReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [resize, setResize] = useState<ResizeState | null>(null)

  const onTitlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (win.maximized) return
      if ((event.target as HTMLElement).closest('button')) return
      focusWindow(win.id)
      event.currentTarget.setPointerCapture(event.pointerId)
      setDrag({
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: win.x,
        originY: win.y,
      })
    },
    [focusWindow, win.id, win.maximized, win.x, win.y],
  )

  const onResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (win.maximized) return
      event.stopPropagation()
      focusWindow(win.id)
      event.currentTarget.setPointerCapture(event.pointerId)
      setResize({
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originW: win.width,
        originH: win.height,
      })
    },
    [focusWindow, win.height, win.id, win.maximized, win.width],
  )

  useEffect(() => {
    if (!drag) return

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointerId) return
      const dx = event.clientX - drag.startX
      const dy = event.clientY - drag.startY
      moveWindow(
        win.id,
        Math.max(8, drag.originX + dx),
        Math.max(48, drag.originY + dy),
      )
    }

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointerId) return
      setDrag(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [drag, moveWindow, win.id])

  useEffect(() => {
    if (!resize) return

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== resize.pointerId) return
      resizeWindow(
        win.id,
        resize.originW + (event.clientX - resize.startX),
        resize.originH + (event.clientY - resize.startY),
      )
    }

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== resize.pointerId) return
      setResize(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [resize, resizeWindow, win.id])

  useEffect(() => {
    if (!win.open || win.minimized) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeWindow(win.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeWindow, win.id, win.minimized, win.open])

  const visible = win.open && !win.minimized

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label={win.title}
          initial={reduced ? false : { opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.97, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onPointerDown={() => focusWindow(win.id)}
          className="pixel-window fixed overflow-hidden rounded-md border-[3px] border-plum bg-cream text-plum-ink shadow-[5px_6px_0_rgba(42,24,48,0.32)]"
          style={{
            zIndex: win.zIndex,
            left: win.maximized ? 12 : win.x,
            top: win.maximized ? 64 : win.y,
            width: win.maximized ? 'calc(100vw - 24px)' : win.width,
            height: win.maximized ? 'calc(100vh - 88px)' : win.height,
            cursor: drag ? 'move' : undefined,
          }}
        >
          <div
            className="flex cursor-grab items-center gap-2 border-b-[3px] border-plum bg-plum px-3 py-2 text-cream active:cursor-grabbing"
            onPointerDown={onTitlePointerDown}
          >
            <span className="font-display text-[9px] leading-none tracking-wide text-cream">
              {win.title}
            </span>
            <div className="ml-auto flex items-center gap-0.5">
              <button
                type="button"
                aria-label={`Minimize ${win.title}`}
                className="rounded-sm border border-cream/25 bg-plum-deep/40 p-1 text-cream hover:bg-cream/20"
                onClick={() => minimizeWindow(win.id)}
              >
                <Minimize2 size={13} />
              </button>
              <button
                type="button"
                aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${win.title}`}
                className="rounded-sm border border-cream/25 bg-plum-deep/40 p-1 text-cream hover:bg-cream/20"
                onClick={() => toggleMaximize(win.id)}
              >
                <Maximize2 size={13} />
              </button>
              <button
                type="button"
                aria-label={`Close ${win.title}`}
                className="rounded-sm border border-cream/25 bg-window-pink/80 p-1 text-plum-ink hover:bg-window-pink"
                onClick={() => closeWindow(win.id)}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="pixel-window-body h-[calc(100%-42px)] overflow-auto bg-gradient-to-b from-cream to-cream-soft p-3">
            {children}
          </div>

          {!win.maximized && (
            <div
              className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
              onPointerDown={onResizePointerDown}
              aria-hidden
            >
              <span className="absolute bottom-1 right-1 h-2.5 w-2.5 border-r-[3px] border-b-[3px] border-plum/55" />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
