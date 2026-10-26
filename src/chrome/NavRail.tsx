import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  Coffee,
  MessageCircle,
  Music2,
  Sprout,
  Timer,
} from 'lucide-react'
import type { AppId } from '../types'
import { useWindows } from '../windows/WindowProvider'
import { glassPanel, pixelTile, pixelTileActive } from './glass'

const ITEMS: { id: AppId; label: string; icon: typeof MessageCircle }[] = [
  { id: 'claude', label: 'Claude', icon: MessageCircle },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'projects', label: 'Projects', icon: Sprout },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'music', label: 'Focus radio', icon: Music2 },
]

export function NavRail() {
  const { openWindow, windows } = useWindows()

  return (
    <nav
      aria-label="Main"
      className={`pointer-events-auto absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl p-2 md:bottom-auto md:left-3 md:top-[52%] md:translate-x-0 md:-translate-y-1/2 md:flex-col ${glassPanel}`}
    >
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const active = windows[id].open && !windows[id].minimized
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active}
            onClick={() => openWindow(id)}
            className={`inline-flex size-10 items-center justify-center rounded-md transition duration-150 ${
              active ? pixelTileActive : pixelTile
            } hover:brightness-110`}
          >
            <Icon size={18} strokeWidth={2.25} />
          </button>
        )
      })}
      <button
        type="button"
        aria-label="Daily motivation"
        title="Daily motivation"
        onClick={() => openWindow('motivation')}
        className={`inline-flex size-10 items-center justify-center rounded-md transition duration-150 ${
          windows.motivation.open && !windows.motivation.minimized
            ? pixelTileActive
            : pixelTile
        } hover:brightness-110`}
      >
        <Coffee size={18} strokeWidth={2.25} />
      </button>
    </nav>
  )
}
