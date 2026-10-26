import type { TimeOfDay } from '../types'

/** Light grades — kept subtle now that real TOD plates drive the look. */
const GRADES: Record<
  TimeOfDay,
  { room: string; window: string; vignette: string }
> = {
  morning: {
    room: 'linear-gradient(180deg, rgba(255,214,190,0.08), transparent 50%, rgba(90,60,80,0.06))',
    window: 'linear-gradient(180deg, rgba(255,200,150,0.12), transparent)',
    vignette: 'radial-gradient(ellipse at center, transparent 55%, rgba(42,24,48,0.18) 100%)',
  },
  afternoon: {
    room: 'linear-gradient(180deg, rgba(255,236,220,0.05), transparent 55%, rgba(70,50,80,0.06))',
    window: 'linear-gradient(180deg, rgba(200,210,230,0.08), transparent)',
    vignette: 'radial-gradient(ellipse at center, transparent 58%, rgba(42,24,48,0.14) 100%)',
  },
  evening: {
    room: 'linear-gradient(180deg, rgba(180,90,140,0.08), transparent 45%, rgba(40,20,40,0.12))',
    window: 'linear-gradient(180deg, rgba(230,120,170,0.1), transparent)',
    vignette: 'radial-gradient(ellipse at center, transparent 48%, rgba(30,14,36,0.28) 100%)',
  },
  night: {
    room: 'linear-gradient(180deg, rgba(40,50,90,0.1), transparent 50%, rgba(15,8,25,0.16))',
    window: 'linear-gradient(180deg, rgba(60,80,140,0.08), transparent)',
    vignette: 'radial-gradient(ellipse at center, transparent 45%, rgba(10,6,20,0.32) 100%)',
  },
}

type Props = {
  timeOfDay: TimeOfDay
}

export function LightingOverlay({ timeOfDay }: Props) {
  const grade = GRADES[timeOfDay]

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div
        className="absolute inset-0 transition-[background] duration-[1600ms] ease-in-out"
        style={{ background: grade.room }}
      />
      <div
        className="absolute transition-[background,opacity] duration-[1600ms] ease-in-out"
        style={{
          left: '28%',
          top: '12%',
          width: '38%',
          height: '40%',
          background: grade.window,
          maskImage:
            'radial-gradient(ellipse 70% 65% at 50% 40%, #000 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 65% at 50% 40%, #000 30%, transparent 75%)',
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="absolute inset-0 transition-[background] duration-[1600ms] ease-in-out"
        style={{ background: grade.vignette }}
      />
    </div>
  )
}
