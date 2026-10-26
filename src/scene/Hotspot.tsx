import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { glassChip } from '../chrome/glass'
import type { HotspotDef } from '../types'

type Props = {
  hotspot: HotspotDef
  onActivate: () => void
}

function chipPosition(chip: HotspotDef['chip']) {
  switch (chip) {
    case 'bottom':
      return 'top-full left-1/2 mt-2 -translate-x-1/2'
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    case 'top':
    default:
      return 'bottom-full left-1/2 mb-2 -translate-x-1/2'
  }
}

export function Hotspot({ hotspot, onActivate }: Props) {
  const [lit, setLit] = useState(false)
  const reduced = useReducedMotion()
  const chipClass = chipPosition(hotspot.chip)

  return (
    <motion.button
      type="button"
      aria-label={hotspot.label}
      data-lit={lit ? 'true' : undefined}
      onClick={onActivate}
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
      onFocus={() => setLit(true)}
      onBlur={() => setLit(false)}
      className="group absolute z-20 cursor-pointer rounded-xl border border-transparent bg-transparent focus-visible:outline-none"
      style={{
        left: `${hotspot.left}%`,
        top: `${hotspot.top}%`,
        width: `${hotspot.width}%`,
        height: `${hotspot.height}%`,
      }}
      animate={reduced ? undefined : { scale: lit ? 1.04 : 1 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      {/* Hit-area glow */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-xl border transition duration-200 ${
          lit
            ? 'border-cream/50 bg-cream/15 shadow-[0_0_0_1px_rgba(247,239,230,0.28),0_0_28px_rgba(217,139,184,0.4)]'
            : 'border-transparent bg-transparent'
        }`}
      />

      {/* Soft outer bloom */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -inset-2 rounded-2xl bg-[radial-gradient(circle,rgba(247,239,230,0.22)_0%,transparent_70%)] transition duration-300 ${
          lit ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Label chip */}
      <span
        className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium tracking-wide text-plum-ink transition duration-200 ${glassChip} ${chipClass} ${
          lit
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-1 scale-95 opacity-0'
        }`}
      >
        {hotspot.name}
      </span>
    </motion.button>
  )
}
