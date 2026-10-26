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
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type AppSettings,
} from './types'

type SettingsContextValue = {
  settings: AppSettings
  setSettings: (next: AppSettings | ((prev: AppSettings) => AppSettings)) => void
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSettingsState(loadSettings())
    setReady(true)
  }, [])

  const setSettings = useCallback(
    (next: AppSettings | ((prev: AppSettings) => AppSettings)) => {
      setSettingsState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(value))
        return value
      })
    },
    [],
  )

  const value = useMemo(
    () => ({ settings, setSettings, settingsOpen, setSettingsOpen }),
    [settings, setSettings, settingsOpen],
  )

  if (!ready) return null

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
