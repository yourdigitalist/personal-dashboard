import { Loader2, Pause, Play, Radio, RefreshCw, SkipForward, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  FALLBACK_STATIONS,
  fetchLofiStations,
  pingStationClick,
  type Station,
} from '../music/radioBrowser'

/** Live lofi / chill radio via radio-browser.info. */
export function MusicApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [stations, setStations] = useState<Station[]>(FALLBACK_STATIONS)
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [error, setError] = useState<string | null>(null)
  const [sourceNote, setSourceNote] = useState('Curated streams')

  const station = stations[index] ?? stations[0]

  const loadStations = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchLofiStations()
      setStations(list)
      setIndex(0)
      setSourceNote(
        list.some((s) => /^[0-9a-f-]{36}$/i.test(s.id))
          ? 'radio-browser.info'
          : 'Fallback streams',
      )
    } catch {
      setStations(FALLBACK_STATIONS)
      setSourceNote('Fallback streams')
      setError('Directory unreachable — using backup stations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStations()
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio
    const onError = () =>
      setError('Stream unavailable — try another station.')
    audio.addEventListener('error', onError)
    return () => {
      audio.pause()
      audio.removeEventListener('error', onError)
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !station) return
    setError(null)
    audio.src = station.src
    pingStationClick(station.id)
    if (playing) {
      void audio.play().catch(() => {
        setPlaying(false)
        setError('Could not start stream (autoplay or network).')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station?.src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      void audio.play().catch(() => {
        setPlaying(false)
        setError('Could not start stream (autoplay or network).')
      })
    } else {
      audio.pause()
    }
  }, [playing])

  const skip = () => {
    if (stations.length === 0) return
    setIndex((i) => (i + 1) % stations.length)
    setPlaying(true)
  }

  if (!station) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-mauve">
        No stations loaded.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3 text-plum-ink">
      <div className="flex items-start gap-2">
        <div className="rounded-xl bg-plum/10 p-2 text-plum">
          <Radio size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[9px] text-plum">Focus radio</p>
          <p className="truncate text-base font-medium">{station.title}</p>
          <p className="text-xs text-mauve">
            {station.mood}
            {station.homepage ? ` · ${station.artist}` : ''}
          </p>
        </div>
        <button
          type="button"
          aria-label="Refresh stations"
          title="Refresh from Radio Browser"
          onClick={() => void loadStations()}
          disabled={loading}
          className="mt-0.5 rounded-lg p-1.5 text-mauve hover:bg-cream hover:text-plum disabled:opacity-40"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
        </button>
        <span
          className={`mt-1 size-2 shrink-0 rounded-full ${playing ? 'bg-lamp animate-pulse' : 'bg-mauve/30'}`}
          aria-hidden
        />
      </div>

      {error && <p className="text-xs text-window-pink">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex size-11 items-center justify-center rounded-2xl bg-plum text-cream shadow-sm hover:bg-plum-deep"
          >
            {playing ? (
              <Pause size={18} strokeWidth={1.75} />
            ) : (
              <Play size={18} strokeWidth={1.75} className="translate-x-px" />
            )}
          </button>
          <button
            type="button"
            aria-label="Next station"
            onClick={skip}
            className="inline-flex size-9 items-center justify-center rounded-xl bg-cream-soft text-plum hover:bg-blush/40"
          >
            <SkipForward size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <Volume2 size={14} className="text-mauve" aria-hidden />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-blush/40 accent-plum"
          />
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-1 overflow-auto rounded-xl bg-cream-soft/70 p-2">
        {loading && (
          <li className="flex items-center gap-2 px-2 py-2 text-[10px] text-mauve">
            <Loader2 size={12} className="animate-spin" />
            Updating from Radio Browser…
          </li>
        )}
        {stations.map((t, i) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => {
                setIndex(i)
                setPlaying(true)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                i === index
                  ? 'bg-plum/15 text-plum-ink'
                  : 'text-mauve hover:bg-cream hover:text-plum-ink'
              }`}
            >
              <span className="truncate font-medium">{t.title}</span>
              <span className="shrink-0 text-[10px] opacity-70">{t.mood}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-mauve">
        Live streams via{' '}
        <a
          href="https://www.radio-browser.info"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Radio Browser
        </a>
        {` · ${sourceNote}`}
      </p>
    </div>
  )
}
