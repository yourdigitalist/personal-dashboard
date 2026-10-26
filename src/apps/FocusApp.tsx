import { Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { loadJson, saveJson } from '../lib/storage'
import {
  FOCUS_SOUNDS,
  FOCUS_SOUND_STORAGE_KEY,
  playFocusSound,
  type FocusSoundId,
} from './focusSounds'

const PRESETS = [15, 25, 45, 60]

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function loadSound(): FocusSoundId {
  const id = loadJson<string>(FOCUS_SOUND_STORAGE_KEY, 'soft')
  return FOCUS_SOUNDS.some((s) => s.id === id) ? (id as FocusSoundId) : 'soft'
}

export function FocusApp() {
  const [minutes, setMinutes] = useState(25)
  const [custom, setCustom] = useState('25')
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [sound, setSound] = useState<FocusSoundId>(loadSound)
  const finishedRef = useRef(false)
  const alertIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    saveJson(FOCUS_SOUND_STORAGE_KEY, sound)
  }, [sound])

  useEffect(() => {
    return () => {
      if (alertIntervalRef.current != null) {
        window.clearInterval(alertIntervalRef.current)
      }
    }
  }, [])

  function stopAlerts() {
    if (alertIntervalRef.current != null) {
      window.clearInterval(alertIntervalRef.current)
      alertIntervalRef.current = null
    }
  }

  function startFinishAlerts(soundId: FocusSoundId) {
    stopAlerts()
    playFocusSound(soundId)
    // Repeat so it can't be missed if the first pass was quiet / overlooked.
    let passes = 1
    alertIntervalRef.current = window.setInterval(() => {
      passes += 1
      playFocusSound(soundId)
      if (passes >= 3) stopAlerts()
    }, 3200)
  }

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false)
          if (!finishedRef.current) {
            finishedRef.current = true
            setDone(true)
            startFinishAlerts(sound)
          }
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
    // sound captured when effect runs; finish uses latest via startFinishAlerts(sound) — include sound
  }, [running, sound])

  function applyMinutes(m: number) {
    const safe = Math.min(180, Math.max(1, Math.round(m)))
    stopAlerts()
    setDone(false)
    setMinutes(safe)
    setCustom(String(safe))
    setRunning(false)
    finishedRef.current = false
    setRemaining(safe * 60)
  }

  function dismissDone() {
    stopAlerts()
    setDone(false)
  }

  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-3 text-center transition-colors ${
        done ? 'bg-lamp/25' : ''
      }`}
    >
      {done ? (
        <div className="animate-pulse rounded-2xl border-2 border-lamp bg-lamp/40 px-4 py-2">
          <p className="font-display text-sm text-plum-ink">Time’s up</p>
          <p className="text-[11px] text-plum">Focus block finished</p>
        </div>
      ) : (
        <p className="font-display text-[10px] text-plum">Focus timer</p>
      )}

      <p
        className={`font-display tracking-widest text-plum-ink ${
          done ? 'text-3xl' : 'text-2xl'
        }`}
      >
        {format(remaining)}
      </p>

      {!done && (
        <>
          <div className="flex flex-wrap justify-center gap-1.5">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => applyMinutes(m)}
                className={`rounded-full px-2.5 py-1 text-[11px] ${
                  minutes === m && !running
                    ? 'bg-plum text-cream'
                    : 'bg-cream-soft text-plum hover:bg-blush/40'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-mauve">
            Custom
            <input
              type="number"
              min={1}
              max={180}
              value={custom}
              disabled={running}
              onChange={(e) => setCustom(e.target.value)}
              onBlur={() => applyMinutes(Number(custom) || 25)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyMinutes(Number(custom) || 25)
              }}
              className="w-16 rounded-lg border border-plum/20 bg-white/80 px-2 py-1 text-sm text-plum-ink outline-none disabled:opacity-50"
            />
            min
          </label>
        </>
      )}

      <label className="flex flex-wrap items-center justify-center gap-2 text-xs text-mauve">
        <Volume2 size={12} aria-hidden />
        Sound
        <select
          value={sound}
          onChange={(e) => {
            const next = e.target.value as FocusSoundId
            setSound(next)
            playFocusSound(next)
          }}
          className="rounded-lg border border-plum/20 bg-white/80 px-2 py-1 text-xs text-plum-ink outline-none"
        >
          {FOCUS_SOUNDS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-lg bg-cream-soft px-2 py-1 text-[10px] text-plum hover:bg-blush/40"
          onClick={() => playFocusSound(sound)}
        >
          Preview
        </button>
      </label>

      {done ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-plum px-4 py-2 text-sm text-cream"
            onClick={() => {
              dismissDone()
              applyMinutes(minutes)
              setRunning(true)
            }}
          >
            Start again
          </button>
          <button
            type="button"
            className="rounded-xl border-2 border-plum/25 px-3 py-2 text-sm text-plum hover:bg-blush/30"
            onClick={() => {
              dismissDone()
              applyMinutes(minutes)
            }}
          >
            Dismiss
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={running ? 'Pause timer' : 'Start timer'}
            className="inline-flex items-center gap-2 rounded-xl bg-plum px-4 py-2 text-sm text-cream"
            onClick={() => {
              if (remaining === 0) applyMinutes(minutes)
              finishedRef.current = false
              setDone(false)
              stopAlerts()
              setRunning((v) => !v)
            }}
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            aria-label="Reset timer"
            className="rounded-xl border-2 border-plum/25 px-3 py-2 text-plum hover:bg-blush/30"
            onClick={() => applyMinutes(minutes)}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}

      <p className="max-w-[16rem] text-[10px] text-mauve">
        {done
          ? 'Alert repeats a few times until you dismiss.'
          : 'Desk lamp opens this too.'}
      </p>
    </div>
  )
}
