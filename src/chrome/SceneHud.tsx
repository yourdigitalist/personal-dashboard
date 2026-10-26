import {
  CloudSun,
  Crosshair,
  LayoutGrid,
  MoonStar,
  Settings,
  Sun,
  Sunset,
} from 'lucide-react'
import { useCalibration } from '../calibrate/CalibrationContext'
import { useScene } from '../context/SceneContext'
import { useSettings } from '../lib/settings/SettingsContext'
import { useWindows } from '../windows/WindowProvider'
import type { LightingMode, TimeOfDay } from '../types'
import { glassChip, glassPanel } from './glass'

const MODES: { id: LightingMode; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Night' },
]

function WeatherIcon({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const props = { size: 16, strokeWidth: 2.25, 'aria-hidden': true as const }
  switch (timeOfDay) {
    case 'morning':
      return <CloudSun {...props} />
    case 'afternoon':
      return <Sun {...props} />
    case 'evening':
      return <Sunset {...props} />
    case 'night':
      return <MoonStar {...props} />
  }
}

function weatherLabel(timeOfDay: TimeOfDay) {
  switch (timeOfDay) {
    case 'morning':
      return 'Soft morning light'
    case 'afternoon':
      return 'Clear afternoon'
    case 'evening':
      return 'Golden dusk'
    case 'night':
      return 'Quiet night'
  }
}

export function SceneHud() {
  const { now, greeting, motivation, mode, setMode, timeOfDay } = useScene()
  const { calibrate, setCalibrate } = useCalibration()
  const { setSettingsOpen } = useSettings()
  const { tidyWindows } = useWindows()

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <div
        className={`pointer-events-none absolute top-3 left-3 z-30 max-w-[min(22rem,55%)] rounded-md px-3.5 py-2.5 ${glassPanel}`}
      >
        <p className="truncate text-sm font-medium text-plum-ink">{greeting}</p>
        <p className="truncate text-xs text-mauve">{motivation}</p>
      </div>

      <div
        className={`pointer-events-auto absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-md px-2 py-1.5 ${glassPanel}`}
      >
        <div
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-plum ${glassChip}`}
          title={weatherLabel(timeOfDay)}
        >
          <WeatherIcon timeOfDay={timeOfDay} />
          <span className="hidden text-xs text-plum sm:inline">
            {weatherLabel(timeOfDay)}
          </span>
        </div>

        <div className="hidden h-5 w-px bg-plum/20 sm:block" aria-hidden />

        <div className="flex flex-col items-end leading-tight px-1 text-plum-ink">
          <span className="text-sm font-medium tabular-nums tracking-wide">
            {timeLabel}
          </span>
          <span className="text-[11px] text-mauve">{dateLabel}</span>
        </div>

        <label
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-plum ${glassChip}`}
        >
          <span className="sr-only">Lighting mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as LightingMode)}
            className="max-w-[6.5rem] cursor-pointer appearance-none bg-transparent text-plum-ink outline-none sm:max-w-[7.5rem]"
            aria-label="Lighting mode"
          >
            {MODES.map((item) => (
              <option
                key={item.id}
                value={item.id}
                className="bg-cream text-plum-ink"
              >
                {item.label}
                {item.id === 'auto' ? ` (${timeOfDay})` : ''}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          aria-label="Tidy windows"
          title="Tidy open windows"
          className={`rounded-md p-1.5 text-plum transition hover:bg-blush/50 ${glassChip}`}
          onClick={() => tidyWindows()}
        >
          <LayoutGrid size={15} strokeWidth={2.25} />
        </button>

        <button
          type="button"
          aria-label={calibrate ? 'Close calibrator' : 'Open calibrator'}
          aria-pressed={calibrate}
          className={`rounded-md p-1.5 transition ${glassChip} ${
            calibrate
              ? 'bg-window-pink text-plum-ink'
              : 'text-plum hover:bg-blush/50'
          }`}
          title="Temporary mapper for lights, dog, and clicks"
          onClick={() => setCalibrate(!calibrate)}
        >
          <Crosshair size={15} strokeWidth={2.25} />
        </button>

        <button
          type="button"
          aria-label="Settings"
          className={`rounded-md p-1.5 text-plum transition hover:bg-blush/50 ${glassChip}`}
          title="Connections, Notion, Claude, daily note prompt"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={15} strokeWidth={2.25} />
        </button>
      </div>
    </>
  )
}
