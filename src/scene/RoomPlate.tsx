import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ROOM_PLATES } from './roomPlates'
import type { TimeOfDay } from '../types'

type Props = {
  timeOfDay: TimeOfDay
}

export function RoomPlate({ timeOfDay }: Props) {
  const reduced = useReducedMotion()
  const src = ROOM_PLATES[timeOfDay]

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={src}
          src={src}
          alt="Cozy pixel-art bedroom and study"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-fill"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  )
}
