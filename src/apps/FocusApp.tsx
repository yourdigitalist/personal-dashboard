import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const PRESETS = [15, 25, 45, 60]

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function playChime() {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99] // C5 E5 G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02 + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + i * 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.12)
      osc.stop(now + 0.7 + i * 0.12)
    })
    window.setTimeout(() => void ctx.close(), 2000)
  } catch {
    // Audio may be blocked until a user gesture — start/pause counts.
  }
}

export function FocusApp() {
  const [minutes, setMinutes] = useState(25)
  const [custom, setCustom] = useState('25')
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const finishedRef = useRef(false)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false)
          if (!finishedRef.current) {
            finishedRef.current = true
            playChime()
          }
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  function applyMinutes(m: number) {
    const safe = Math.min(180, Math.max(1, Math.round(m)))
    setMinutes(safe)
    setCustom(String(safe))
    setRunning(false)
    finishedRef.current = false
    setRemaining(safe * 60)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <p className="font-display text-[10px] text-plum">Focus timer</p>
      <p className="font-display text-2xl tracking-widest text-plum-ink">
        {format(remaining)}
      </p>

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

      <p className="max-w-[16rem] text-xs text-mauve">
        Soft chime when the block ends. Desk lamp opens this too.
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={running ? 'Pause timer' : 'Start timer'}
          className="inline-flex items-center gap-2 rounded-xl bg-plum px-4 py-2 text-sm text-cream"
          onClick={() => {
            if (remaining === 0) applyMinutes(minutes)
            finishedRef.current = false
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
    </div>
  )
}
