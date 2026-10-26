import { useMemo, useState } from 'react'
import { useSettings } from '../lib/settings/SettingsContext'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

type CalEvent = {
  id: string
  day: number
  title: string
  time: string
  source: 'google' | 'microsoft' | 'local'
}

export function CalendarApp() {
  const { settings, setSettingsOpen } = useSettings()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selected, setSelected] = useState<number | null>(() => new Date().getDate())
  const today = new Date()

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const items: Array<{ day: number | null; key: string }> = []
    for (let i = 0; i < firstDow; i++) items.push({ day: null, key: `pad-${i}` })
    for (let day = 1; day <= daysInMonth; day++) {
      items.push({ day, key: `d-${day}` })
    }
    return items
  }, [cursor])

  const events = useMemo(() => {
    const list: CalEvent[] = [
      {
        id: 'l1',
        day: today.getDate(),
        title: 'Focus block',
        time: '10:00',
        source: 'local',
      },
    ]
    if (settings.googleCalendar.status === 'connected') {
      list.push({
        id: 'g1',
        day: today.getDate(),
        title: 'Google: Team sync',
        time: '14:00',
        source: 'google',
      })
      list.push({
        id: 'g2',
        day: Math.min(today.getDate() + 1, 28),
        title: 'Google: Dentist',
        time: '09:30',
        source: 'google',
      })
    }
    if (settings.microsoftCalendar.status === 'connected') {
      list.push({
        id: 'm1',
        day: today.getDate(),
        title: 'Outlook: 1:1',
        time: '16:00',
        source: 'microsoft',
      })
    }
    return list
  }, [settings.googleCalendar.status, settings.microsoftCalendar.status, today])

  const dayEvents = events.filter((e) => e.day === selected)
  const label = cursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        <span
          className={`rounded-full px-2 py-0.5 ${
            settings.googleCalendar.status === 'connected'
              ? 'bg-window-pink/50 text-plum-ink'
              : 'bg-mauve/15 text-mauve'
          }`}
        >
          Google {settings.googleCalendar.status === 'connected' ? 'on' : 'off'}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 ${
            settings.microsoftCalendar.status === 'connected'
              ? 'bg-lavender/50 text-plum-ink'
              : 'bg-mauve/15 text-mauve'
          }`}
        >
          Microsoft {settings.microsoftCalendar.status === 'connected' ? 'on' : 'off'}
        </span>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="ml-auto text-plum underline"
        >
          Connect in Settings
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm text-plum hover:bg-blush/40"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-display text-[10px] text-plum">{label}</p>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-sm text-plum hover:bg-blush/40"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-mauve">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
        {cells.map((cell) => {
          const isToday =
            cell.day !== null &&
            cell.day === today.getDate() &&
            cursor.getMonth() === today.getMonth() &&
            cursor.getFullYear() === today.getFullYear()
          const hasEvent = cell.day !== null && events.some((e) => e.day === cell.day)
          const isSelected = cell.day === selected
          return (
            <button
              key={cell.key}
              type="button"
              disabled={cell.day === null}
              onClick={() => cell.day && setSelected(cell.day)}
              className={`rounded-md py-1.5 text-sm ${
                cell.day === null
                  ? 'opacity-0'
                  : isSelected
                    ? 'bg-plum text-cream'
                    : isToday
                      ? 'bg-window-pink font-semibold text-plum-ink'
                      : 'text-plum-ink hover:bg-blush/40'
              }`}
            >
              {cell.day}
              {hasEvent && !isSelected && (
                <span className="mx-auto mt-0.5 block size-1 rounded-full bg-plum/50" />
              )}
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-auto border-t border-plum/15 pt-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-mauve">
          {selected ? `Day ${selected}` : 'Pick a day'}
        </p>
        {dayEvents.length === 0 && (
          <p className="text-xs text-mauve">No events — connect calendars for live data.</p>
        )}
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start justify-between gap-2 rounded-lg bg-cream-soft px-2.5 py-2"
          >
            <div>
              <p className="text-sm text-plum-ink">{event.title}</p>
              <p className="text-[11px] text-mauve">{event.time}</p>
            </div>
            <span className="rounded-md bg-blush/40 px-1.5 py-0.5 text-[10px] capitalize text-plum">
              {event.source}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
