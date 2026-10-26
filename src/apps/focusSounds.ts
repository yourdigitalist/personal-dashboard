export type FocusSoundId = 'soft' | 'bell' | 'wood' | 'chirp' | 'alarm' | 'silent'

export const FOCUS_SOUNDS: { id: FocusSoundId; label: string; hint: string }[] = [
  { id: 'soft', label: 'Soft triad', hint: 'Gentle C–E–G' },
  { id: 'bell', label: 'Bell', hint: 'Bright & lingering' },
  { id: 'wood', label: 'Woodblock', hint: 'Short taps' },
  { id: 'chirp', label: 'Chirp', hint: 'Quick ascending' },
  { id: 'alarm', label: 'Alarm', hint: 'Hard to miss' },
  { id: 'silent', label: 'Silent', hint: 'Visual only' },
]

export const FOCUS_SOUND_STORAGE_KEY = 'mlc-focus-sound-v1'

type Tone = {
  freq: number
  start: number
  dur: number
  type?: OscillatorType
  peak?: number
}

function schedule(ctx: AudioContext, tones: Tone[]) {
  const now = ctx.currentTime
  for (const t of tones) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = t.type ?? 'sine'
    osc.frequency.value = t.freq
    const peak = t.peak ?? 0.18
    const start = now + t.start
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + t.dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + t.dur + 0.05)
  }
}

function buildTones(id: FocusSoundId): Tone[] {
  switch (id) {
    case 'silent':
      return []
    case 'soft': {
      const tones: Tone[] = []
      for (let r = 0; r < 3; r++) {
        const base = r * 1.1
        ;[523.25, 659.25, 783.99].forEach((freq, i) => {
          tones.push({
            freq,
            start: base + i * 0.12,
            dur: 0.55,
            peak: 0.16,
          })
        })
      }
      return tones
    }
    case 'bell': {
      const tones: Tone[] = []
      for (let r = 0; r < 3; r++) {
        const base = r * 1.4
        tones.push(
          { freq: 880, start: base, dur: 1.1, peak: 0.2 },
          { freq: 1760, start: base, dur: 0.7, peak: 0.08 },
          { freq: 660, start: base + 0.35, dur: 0.9, peak: 0.14 },
        )
      }
      return tones
    }
    case 'wood': {
      const tones: Tone[] = []
      for (let r = 0; r < 4; r++) {
        const base = r * 0.55
        ;[0, 0.14, 0.28].forEach((off) => {
          tones.push({
            freq: 420 + off * 40,
            start: base + off,
            dur: 0.08,
            type: 'triangle',
            peak: 0.28,
          })
        })
      }
      return tones
    }
    case 'chirp': {
      const tones: Tone[] = []
      for (let r = 0; r < 3; r++) {
        const base = r * 0.85
        ;[523, 587, 659, 784, 880].forEach((freq, i) => {
          tones.push({
            freq,
            start: base + i * 0.07,
            dur: 0.18,
            type: 'sine',
            peak: 0.2,
          })
        })
      }
      return tones
    }
    case 'alarm': {
      const tones: Tone[] = []
      for (let r = 0; r < 5; r++) {
        const base = r * 0.7
        tones.push(
          { freq: 880, start: base, dur: 0.22, type: 'square', peak: 0.12 },
          { freq: 660, start: base + 0.25, dur: 0.22, type: 'square', peak: 0.12 },
        )
      }
      return tones
    }
  }
}

/** Louder, multi-pass finish alert. Safe no-op if audio is blocked. */
export function playFocusSound(id: FocusSoundId) {
  if (id === 'silent') return
  try {
    const ctx = new AudioContext()
    const tones = buildTones(id)
    schedule(ctx, tones)
    const last = tones.reduce((m, t) => Math.max(m, t.start + t.dur), 0)
    window.setTimeout(() => void ctx.close(), Math.ceil((last + 0.4) * 1000))
  } catch {
    // Needs a prior user gesture (Start counts).
  }
}
