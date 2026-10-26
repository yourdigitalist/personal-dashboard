import { useEffect } from 'react'
import { useSettings } from '../lib/settings/SettingsContext'
import { useWindows } from '../windows/WindowProvider'

/** Opens the Settings floating window when gear sets settingsOpen. */
export function SettingsBridge() {
  const { settingsOpen, setSettingsOpen } = useSettings()
  const { openWindow } = useWindows()

  useEffect(() => {
    if (!settingsOpen) return
    openWindow('settings')
    setSettingsOpen(false)
  }, [settingsOpen, openWindow, setSettingsOpen])

  return null
}
