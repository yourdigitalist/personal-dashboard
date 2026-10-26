export type Station = {
  id: string
  title: string
  artist: string
  src: string
  mood: string
  homepage?: string
}

type RadioBrowserStation = {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  homepage: string
  tags: string
  codec: string
  bitrate: number
  hls: number
  lastcheckok: number
  clickcount: number
}

const UA = 'MyLittleCorner/1.0 (personal dashboard)'

/** Known-good HTTPS MP3 streams if the directory is unreachable. */
export const FALLBACK_STATIONS: Station[] = [
  {
    id: 'reyfm-lofi',
    title: 'REYFM #lofi',
    artist: 'REYFM',
    src: 'https://listen.reyfm.de/lofi_128kbps.mp3',
    mood: 'Lofi',
    homepage: 'https://reyfm.de',
  },
  {
    id: 'bigfm-lofi',
    title: 'bigFM LoFi Focus',
    artist: 'bigFM',
    src: 'https://stream.bigfm.de/lofifocus/mp3-128/radiobrowser',
    mood: 'Focus',
    homepage: 'https://www.bigfm.de',
  },
  {
    id: 'somafm-groovesalad',
    title: 'Groove Salad',
    artist: 'SomaFM',
    src: 'https://ice4.somafm.com/groovesalad-128-mp3',
    mood: 'Chill',
    homepage: 'https://somafm.com',
  },
  {
    id: 'lautfm-lofi',
    title: 'laut.fm lofi',
    artist: 'laut.fm',
    src: 'https://stream.laut.fm/lofi',
    mood: 'Lofi',
    homepage: 'https://laut.fm/lofi',
  },
  {
    id: 'isekoi-chill',
    title: 'ISEKOI Chill Zone',
    artist: 'ISEKOI Radio',
    src: 'https://public.isekoi-radio.com/listen/chill/radio.mp3',
    mood: 'Chill',
    homepage: 'https://isekoi-radio.com',
  },
]

/** Case-insensitive substrings — drop from directory results. */
const BLOCKED_NAME_PARTS = [
  'radio wa3',
  'box lofi',
  'hunter.fm',
  'hunter fm',
  'yojosuknam',
  'digital malayali',
  'drone zone',
]

function isBlockedName(name: string): boolean {
  const n = name.toLowerCase()
  return BLOCKED_NAME_PARTS.some((part) => n.includes(part))
}

function tagsMood(tags: string): string {
  const t = tags.toLowerCase()
  if (t.includes('jazz')) return 'Jazz'
  if (t.includes('focus') || t.includes('study')) return 'Focus'
  if (t.includes('chillhop') || t.includes('chill')) return 'Chill'
  if (t.includes('ambient')) return 'Ambient'
  if (t.includes('lofi') || t.includes('lo-fi') || t.includes('lo fi')) return 'Lofi'
  return 'Radio'
}

function isPlayable(s: RadioBrowserStation): boolean {
  const url = (s.url_resolved || s.url || '').trim()
  if (!url.startsWith('https://')) return false
  if (s.hls === 1) return false
  if (s.lastcheckok === 0) return false
  const codec = (s.codec || '').toLowerCase()
  if (codec && !codec.includes('mp3') && !codec.includes('mpeg') && codec !== 'unknown') {
    return false
  }
  return true
}

function cleanTitle(name: string): string {
  let t = name.replace(/\s+/g, ' ').trim() || 'Untitled station'
  // Drop tag-dump suffixes like "|| LoFi, Chill, Study..."
  const pipe = t.indexOf('||')
  if (pipe > 0) t = t.slice(0, pipe).trim()
  if (t.length > 42) t = `${t.slice(0, 40).trim()}…`
  return t
}

function toStation(s: RadioBrowserStation): Station {
  return {
    id: s.stationuuid,
    title: cleanTitle(s.name),
    artist: 'Radio Browser',
    src: s.url_resolved || s.url,
    mood: tagsMood(s.tags || ''),
    homepage: s.homepage || undefined,
  }
}

async function pickApiBase(): Promise<string> {
  try {
    const res = await fetch('https://all.api.radio-browser.info/json/servers', {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(String(res.status))
    const servers = (await res.json()) as { name: string }[]
    const name = servers[Math.floor(Math.random() * servers.length)]?.name
    if (name) return `https://${name}`
  } catch {
    /* fall through */
  }
  return 'https://de1.api.radio-browser.info'
}

async function search(
  base: string,
  params: Record<string, string>,
): Promise<RadioBrowserStation[]> {
  const qs = new URLSearchParams({
    hidebroken: 'true',
    order: 'clickcount',
    reverse: 'true',
    limit: '30',
    ...params,
  })
  const res = await fetch(`${base}/json/stations/search?${qs}`, {
    headers: {
      Accept: 'application/json',
      // Browser overrides User-Agent; kept for non-browser callers / docs compliance.
      'User-Agent': UA,
    },
  })
  if (!res.ok) throw new Error(`Radio Browser ${res.status}`)
  return (await res.json()) as RadioBrowserStation[]
}

/** Fetch live lofi / chill stations from radio-browser.info. */
export async function fetchLofiStations(): Promise<Station[]> {
  const base = await pickApiBase()
  const batches = await Promise.allSettled([
    search(base, { tag: 'lofi', tagExact: 'true' }),
    search(base, { name: 'lofi' }),
    search(base, { tag: 'chillhop' }),
  ])

  const seen = new Set<string>()
  const out: Station[] = []

  for (const batch of batches) {
    if (batch.status !== 'fulfilled') continue
    for (const raw of batch.value) {
      if (!isPlayable(raw)) continue
      if (isBlockedName(raw.name)) continue
      const station = toStation(raw)
      if (isBlockedName(station.title)) continue
      if (seen.has(station.id) || seen.has(station.src)) continue
      seen.add(station.id)
      seen.add(station.src)
      out.push(station)
      if (out.length >= 18) break
    }
    if (out.length >= 18) break
  }

  if (out.length === 0) return FALLBACK_STATIONS

  // Prefer known-good fallbacks at the top when also present / as anchors.
  const merged = [...FALLBACK_STATIONS]
  for (const s of out) {
    if (merged.some((m) => m.src === s.src || m.id === s.id)) continue
    merged.push(s)
  }
  return merged.slice(0, 20)
}

/** Optional click ping so Radio Browser can rank popular stations. */
export function pingStationClick(stationUuid: string) {
  if (!stationUuid || stationUuid.includes('-') === false) return
  // UUIDs from directory; skip our fallback slug ids.
  if (!/^[0-9a-f-]{36}$/i.test(stationUuid)) return
  void pickApiBase()
    .then((base) =>
      fetch(`${base}/json/url/${stationUuid}`, {
        headers: { Accept: 'application/json', 'User-Agent': UA },
      }),
    )
    .catch(() => {})
}
