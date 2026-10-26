import type { Station } from './radioBrowser'
import { FALLBACK_STATIONS } from './radioBrowser'

export type Track = Station

/** Offline / API-failure station list (Radio Browser HTTPS MP3 streams). */
export const TRACKS: Track[] = FALLBACK_STATIONS
