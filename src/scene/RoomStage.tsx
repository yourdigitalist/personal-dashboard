import { Calibrator } from '../calibrate/Calibrator'
import { useCalibration } from '../calibrate/CalibrationContext'
import { NavRail } from '../chrome/NavRail'
import { SceneHud } from '../chrome/SceneHud'
import { useScene } from '../context/SceneContext'
import { useWindows } from '../windows/WindowProvider'
import { AmbientEffects } from './AmbientEffects'
import { WispSystem } from './ambience/WispSystem'
import { Hotspot } from './Hotspot'
import { LightingOverlay } from './LightingOverlay'
import { LungsBulge } from './LungsBulge'
import { RoomPlate } from './RoomPlate'

export function RoomStage() {
  const { timeOfDay } = useScene()
  const { openWindow } = useWindows()
  const { map, calibrate } = useCalibration()

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-plum-ink"
      style={{ containerType: 'size' }}
    >
      <div
        className="relative overflow-hidden rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        style={{
          aspectRatio: '16 / 9',
          width: 'min(100cqw, calc(100cqh * 16 / 9))',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <RoomPlate timeOfDay={timeOfDay} />
        <LungsBulge />
        <LightingOverlay timeOfDay={timeOfDay} />
        <AmbientEffects timeOfDay={timeOfDay} />
        <WispSystem timeOfDay={timeOfDay} />

        {!calibrate &&
          map.hotspots.map((hotspot) => (
            <Hotspot
              key={hotspot.id}
              hotspot={hotspot}
              onActivate={() => openWindow(hotspot.appId)}
            />
          ))}

        <SceneHud />
        {!calibrate && <NavRail />}
        <Calibrator />
      </div>
    </div>
  )
}
