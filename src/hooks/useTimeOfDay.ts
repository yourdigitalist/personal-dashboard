import { useEffect, useMemo, useState } from 'react'
import type { LightingMode, TimeOfDay } from '../types'

const MOTIVATIONS: Record<TimeOfDay, string[]> = {
  morning: [
    'Progress over perfection.',
    'Start soft. Stay steady.',
    'One gentle step is enough.',
  ],
  afternoon: [
    'Protect your focus.',
    'Slow is still forward.',
    'Finish what matters most.',
  ],
  evening: [
    'Close loops with kindness.',
    'Leave room for rest.',
    'You did enough today.',
  ],
  night: [
    'Let the day settle.',
    'Tomorrow can wait.',
    'Soft light, soft mind.',
  ],
}

export function getTimeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export function greetingFor(timeOfDay: TimeOfDay, name = 'Marina'): string {
  switch (timeOfDay) {
    case 'morning':
      return `Good morning, ${name}`
    case 'afternoon':
      return `Good afternoon, ${name}`
    case 'evening':
      return `Good evening, ${name}`
    case 'night':
      return `Good night, ${name}`
  }
}

export function useClock(tickMs = 30_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])

  return now
}

export function useTimeOfDay(mode: LightingMode) {
  const now = useClock()
  const auto = getTimeOfDayFromHour(now.getHours())
  const timeOfDay: TimeOfDay = mode === 'auto' ? auto : mode

  const motivation = useMemo(() => {
    const list = MOTIVATIONS[timeOfDay]
    const daySeed = now.getFullYear() * 1000 + now.getMonth() * 40 + now.getDate()
    return list[daySeed % list.length]
  }, [now, timeOfDay])

  return {
    now,
    auto,
    timeOfDay,
    greeting: greetingFor(timeOfDay),
    motivation,
  }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}
