import type { TimeOfDay } from '../types'

/**
 * Room plates per time of day.
 * Drop replacements into public/room/ — afternoon.jpg & evening.jpg
 * are placeholders (morning/night copies) until you upload dedicated art.
 */
export const ROOM_PLATES: Record<TimeOfDay, string> = {
  morning: '/room/morning.jpg?v=2',
  afternoon: '/room/afternoon.jpg?v=3',
  evening: '/room/evening.jpg?v=2',
  night: '/room/night.jpg?v=2',
}

export const LOUIE_LAYER = {
  src: '/room/layers/louie.png?v=2',
  left: 31,
  top: 60,
  width: 19,
  height: 26,
}
