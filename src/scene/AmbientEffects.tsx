import { useCalibration } from '../calibrate/CalibrationContext'
import { usePrefersReducedMotion } from '../hooks/useTimeOfDay'
import type { TimeOfDay } from '../types'

type Props = {
  timeOfDay: TimeOfDay
}

/** Lights + mug steam only. Wisps live in WispSystem (Canvas). */
export function AmbientEffects({ timeOfDay }: Props) {
  const reduced = usePrefersReducedMotion()
  const { map } = useCalibration()
  const eveningish = timeOfDay === 'evening' || timeOfDay === 'night'
  const dayish = timeOfDay === 'morning' || timeOfDay === 'afternoon'
  const showStars = timeOfDay === 'night'

  return (
    <div className="pointer-events-none absolute inset-0 z-[9] overflow-hidden">
      {map.lights.map((light) => {
        const strong = eveningish || timeOfDay === 'morning'
        const opacity = strong ? 1 : dayish ? 0.55 : 0.35
        const gradient =
          light.kind === 'candle'
            ? 'radial-gradient(circle, rgba(255,170,90,0.75) 0%, rgba(255,140,60,0.28) 35%, transparent 70%)'
            : light.kind === 'orb'
              ? 'radial-gradient(circle, rgba(255,230,170,0.7) 0%, rgba(255,200,120,0.25) 40%, transparent 72%)'
              : 'radial-gradient(circle, rgba(255,210,130,0.75) 0%, rgba(255,170,80,0.3) 40%, transparent 72%)'

        return (
          <div
            key={light.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-700 ${
              light.kind === 'candle' ? 'candle-flicker' : 'lamp-glow'
            }`}
            style={{
              left: `${light.left}%`,
              top: `${light.top}%`,
              width: `${light.size}%`,
              aspectRatio: '1',
              background: gradient,
              mixBlendMode: 'screen',
              opacity,
            }}
          />
        )
      })}

      {!reduced && (
        <div
          className="absolute"
          style={{
            left: `${map.mugSteam.left}%`,
            top: `${map.mugSteam.top}%`,
            width: `${map.mugSteam.width}%`,
            height: `${map.mugSteam.height}%`,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="steam-wisp absolute bottom-0 left-1/2 h-8 w-2 -translate-x-1/2 rounded-full bg-cream/70 blur-[1.5px]"
              style={{
                marginLeft: `${(i - 1.5) * 5}px`,
                animationDelay: `${i * 0.9}s`,
              }}
            />
          ))}
        </div>
      )}

      {!reduced &&
        showStars &&
        Array.from({ length: 18 }, (_, i) => (
          <span
            key={`star-${i}`}
            className="star-dot absolute rounded-full bg-cream"
            style={{
              left: `${28 + ((i * 17) % 38)}%`,
              top: `${12 + ((i * 11) % 28)}%`,
              width: 2 + (i % 2),
              height: 2 + (i % 2),
              animationDelay: `${(i * 0.4) % 3}s`,
              boxShadow: '0 0 6px rgba(247,239,230,0.9)',
            }}
          />
        ))}
    </div>
  )
}
