import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTimeOfDay } from '../hooks/useTimeOfDay'
import type { LightingMode, TimeOfDay } from '../types'

type SceneContextValue = {
  mode: LightingMode
  setMode: (mode: LightingMode) => void
  timeOfDay: TimeOfDay
  auto: TimeOfDay
  now: Date
  greeting: string
  motivation: string
}

const SceneContext = createContext<SceneContextValue | null>(null)

export function SceneProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LightingMode>('auto')
  const clock = useTimeOfDay(mode)

  const value = useMemo(
    () => ({
      mode,
      setMode,
      ...clock,
    }),
    [mode, clock],
  )

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
}

export function useScene() {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used within SceneProvider')
  return ctx
}
