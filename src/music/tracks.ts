export type Track = {
  id: string
  title: string
  artist: string
  src: string
  license: string
  mood: string
}

/**
 * Live soft / focus radio (SomaFM — free to listen, attribute the station).
 * Suggested over bundling more MP3s: always “on air”, jazz + chill focus.
 * Alternatives later: Radio Browser API, custom Icecast, Spotify embed.
 */
export const TRACKS: Track[] = [
  {
    id: 'jazzcafe',
    title: 'Jazz Café',
    artist: 'SomaFM',
    src: 'https://ice1.somafm.com/jazzcafe-128-mp3',
    license: 'SomaFM',
    mood: 'Soft jazz',
  },
  {
    id: 'groovesalad',
    title: 'Groove Salad',
    artist: 'SomaFM',
    src: 'https://ice1.somafm.com/groovesalad-128-mp3',
    license: 'SomaFM',
    mood: 'Chill focus',
  },
  {
    id: 'dronezone',
    title: 'Drone Zone',
    artist: 'SomaFM',
    src: 'https://ice1.somafm.com/dronezone-128-mp3',
    license: 'SomaFM',
    mood: 'Deep focus',
  },
  {
    id: 'sonicuniverse',
    title: 'Sonic Universe',
    artist: 'SomaFM',
    src: 'https://ice1.somafm.com/sonicuniverse-128-mp3',
    license: 'SomaFM',
    mood: 'Avant jazz',
  },
]
