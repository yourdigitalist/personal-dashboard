import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_SCENE_MAP,
  SCENE_MAP_STORAGE_KEY,
  type SceneMap,
} from '../scene/sceneMap'

type CalibrationContextValue = {
  map: SceneMap
  setMap: (map: SceneMap | ((prev: SceneMap) => SceneMap)) => void
  resetMap: () => void
  calibrate: boolean
  setCalibrate: (on: boolean) => void
}

const CalibrationContext = createContext<CalibrationContextValue | null>(null)

function saneRect(
  value: Partial<SceneMap['dogLungs']> | undefined,
  fallback: SceneMap['dogLungs'],
) {
  const left = Number(value?.left)
  const top = Number(value?.top)
  const width = Number(value?.width)
  const height = Number(value?.height)
  if (
    ![left, top, width, height].every((n) => Number.isFinite(n)) ||
    width < 0.8 ||
    height < 0.8
  ) {
    return fallback
  }
  return { left, top, width, height }
}

function mergeHotspots(
  saved: SceneMap['hotspots'] | undefined,
): SceneMap['hotspots'] {
  const byId = new Map((saved ?? []).map((h) => [h.id, h]))
  // Always keep every default hotspot (e.g. Louie) even if an older save omitted it
  return DEFAULT_SCENE_MAP.hotspots.map((def) => {
    const override = byId.get(def.id)
    if (!override) return def
    return {
      ...def,
      ...override,
      ...saneRect(override, def),
      id: def.id,
      name: def.name,
      label: def.label,
      appId: def.appId,
      chip: override.chip ?? def.chip,
    }
  })
}

function loadMap(): SceneMap {
  try {
    const raw = localStorage.getItem(SCENE_MAP_STORAGE_KEY)
    if (!raw) return DEFAULT_SCENE_MAP
    const parsed = JSON.parse(raw) as SceneMap
    if (parsed?.version !== 1) return DEFAULT_SCENE_MAP
    return {
      ...DEFAULT_SCENE_MAP,
      ...parsed,
      lights: parsed.lights?.length ? parsed.lights : DEFAULT_SCENE_MAP.lights,
      mugSteam: saneRect(parsed.mugSteam, DEFAULT_SCENE_MAP.mugSteam),
      dogLungs: saneRect(parsed.dogLungs, DEFAULT_SCENE_MAP.dogLungs),
      hotspots: mergeHotspots(parsed.hotspots),
    }
  } catch {
    return DEFAULT_SCENE_MAP
  }
}

export function CalibrationProvider({ children }: { children: ReactNode }) {
  const [map, setMapState] = useState<SceneMap>(DEFAULT_SCENE_MAP)
  const [calibrate, setCalibrate] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMapState(loadMap())
    const params = new URLSearchParams(window.location.search)
    if (params.get('calibrate') === '1') setCalibrate(true)
    setReady(true)
  }, [])

  const setMap = useCallback((next: SceneMap | ((prev: SceneMap) => SceneMap)) => {
    setMapState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      localStorage.setItem(SCENE_MAP_STORAGE_KEY, JSON.stringify(value))
      return value
    })
  }, [])

  const resetMap = useCallback(() => {
    localStorage.removeItem(SCENE_MAP_STORAGE_KEY)
    setMapState(DEFAULT_SCENE_MAP)
  }, [])

  const value = useMemo(
    () => ({ map, setMap, resetMap, calibrate, setCalibrate }),
    [map, setMap, resetMap, calibrate],
  )

  if (!ready) return null

  return (
    <CalibrationContext.Provider value={value}>
      {children}
    </CalibrationContext.Provider>
  )
}

export function useCalibration() {
  const ctx = useContext(CalibrationContext)
  if (!ctx) throw new Error('useCalibration must be used within CalibrationProvider')
  return ctx
}
