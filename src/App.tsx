import { CalibrationProvider } from './calibrate/CalibrationContext'
import { SceneProvider } from './context/SceneContext'
import { SettingsProvider } from './lib/settings/SettingsContext'
import { RoomStage } from './scene/RoomStage'
import { WindowLayer } from './windows/WindowLayer'
import { WindowProvider } from './windows/WindowProvider'
import { SettingsBridge } from './chrome/SettingsBridge'

export default function App() {
  return (
    <SceneProvider>
      <WindowProvider>
        <SettingsProvider>
          <CalibrationProvider>
            <div className="relative h-full w-full overflow-hidden bg-plum-ink">
              <div className="absolute inset-0">
                <RoomStage />
              </div>
              <WindowLayer />
              <SettingsBridge />
            </div>
          </CalibrationProvider>
        </SettingsProvider>
      </WindowProvider>
    </SceneProvider>
  )
}
