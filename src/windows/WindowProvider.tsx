import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppId, WindowState } from '../types'
import {
  computeTidyLayout,
  loadWindows,
  saveWindows,
} from './windowMeta'

type WindowContextValue = {
  windows: Record<AppId, WindowState>
  openWindow: (id: AppId) => void
  closeWindow: (id: AppId) => void
  minimizeWindow: (id: AppId) => void
  toggleMaximize: (id: AppId) => void
  focusWindow: (id: AppId) => void
  moveWindow: (id: AppId, x: number, y: number) => void
  resizeWindow: (id: AppId, width: number, height: number) => void
  tidyWindows: () => void
}

const WindowContext = createContext<WindowContextValue | null>(null)

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState(loadWindows)
  const [topZ, setTopZ] = useState(() => {
    const zs = Object.values(loadWindows()).map((w) => w.zIndex)
    return Math.max(20, ...zs)
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    saveWindows(windows)
  }, [windows, ready])

  const focusWindow = useCallback((id: AppId) => {
    setTopZ((z) => {
      const next = z + 1
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], zIndex: next, minimized: false },
      }))
      return next
    })
  }, [])

  const openWindow = useCallback((id: AppId) => {
    setTopZ((z) => {
      const next = z + 1
      setWindows((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          open: true,
          minimized: false,
          zIndex: next,
        },
      }))
      return next
    })
  }, [])

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], open: false, minimized: false, maximized: false },
    }))
  }, [])

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], minimized: true },
    }))
  }, [])

  const toggleMaximize = useCallback((id: AppId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], maximized: !prev[id].maximized, minimized: false },
    }))
  }, [])

  const moveWindow = useCallback((id: AppId, x: number, y: number) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], x, y },
    }))
  }, [])

  const resizeWindow = useCallback(
    (id: AppId, width: number, height: number) => {
      setWindows((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          width: Math.max(260, width),
          height: Math.max(180, height),
        },
      }))
    },
    [],
  )

  const tidyWindows = useCallback(() => {
    setWindows((prev) => {
      const patch = computeTidyLayout(prev)
      const next = { ...prev }
      for (const id of Object.keys(patch) as AppId[]) {
        next[id] = { ...next[id], ...patch[id] }
      }
      return next
    })
    setTopZ((z) => z + 10)
  }, [])

  const value = useMemo(
    () => ({
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      toggleMaximize,
      focusWindow,
      moveWindow,
      resizeWindow,
      tidyWindows,
    }),
    [
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      toggleMaximize,
      focusWindow,
      moveWindow,
      resizeWindow,
      tidyWindows,
      topZ,
    ],
  )

  return (
    <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
  )
}

export function useWindows() {
  const ctx = useContext(WindowContext)
  if (!ctx) throw new Error('useWindows must be used within WindowProvider')
  return ctx
}
