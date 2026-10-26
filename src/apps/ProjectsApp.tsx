import { useEffect, useState } from 'react'
import { useSettings } from '../lib/settings/SettingsContext'
import { loadJson, saveJson } from '../lib/storage'

type Project = {
  id: string
  name: string
  status: string
  note: string
}

const MINE_KEY = 'mlc-projects-mine-v1'

const NOTION_SEED: Project[] = [
  {
    id: 'np1',
    name: 'Content pipeline',
    status: 'Active',
    note: 'From Notion — drafts & publish cadence',
  },
  {
    id: 'np2',
    name: 'Home admin',
    status: 'Ongoing',
    note: 'Bills, repairs, seasonal resets',
  },
]

const DEFAULT_MINE: Project[] = [
  {
    id: '1',
    name: 'My Little Corner',
    status: 'Active',
    note: 'Visual prototype and window system',
  },
  {
    id: '2',
    name: 'Studio refresh',
    status: 'Someday',
    note: 'Desk layout, plant rotation, lighting',
  },
]

/**
 * Recommendation baked in:
 * - Tasks = Notion “today/inbox” + personal quick adds
 * - Projects = Notion project DB (status boards) + personal projects you don’t want in Notion
 */
export function ProjectsApp() {
  const { settings, setSettingsOpen } = useSettings()
  const notionOn = settings.notion.status === 'connected'
  const [mine, setMine] = useState<Project[]>(() =>
    loadJson(MINE_KEY, DEFAULT_MINE),
  )
  const [name, setName] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    saveJson(MINE_KEY, mine)
  }, [mine])

  function addMine() {
    const n = name.trim()
    if (!n) return
    setMine((prev) => [
      {
        id: crypto.randomUUID(),
        name: n,
        status: 'Active',
        note: note.trim() || 'Personal project',
      },
      ...prev,
    ])
    setName('')
    setNote('')
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-xs text-mauve">
        Notion for shared/status boards; Mine for private corner projects.
      </p>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto">
        <section>
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-plum">
              From Notion
            </h3>
            {!notionOn && (
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="text-[10px] text-plum underline"
              >
                Connect
              </button>
            )}
          </div>
          {notionOn ? (
            <ul className="space-y-2">
              {NOTION_SEED.map((project) => (
                <ProjectCard key={project.id} project={project} badge="Notion" />
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-cream-soft px-2.5 py-2 text-xs text-mauve">
              Connect Notion + a projects database ID in Settings.
            </p>
          )}
        </section>

        <section>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-plum">
            My projects
          </h3>
          <ul className="space-y-2">
            {mine.map((project) => (
              <ProjectCard key={project.id} project={project} badge="Mine" />
            ))}
          </ul>
        </section>
      </div>

      <div className="space-y-2 border-t border-plum/15 pt-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="w-full rounded-lg border-2 border-plum/20 bg-white/70 px-3 py-2 text-sm outline-none focus:border-plum/50"
        />
        <div className="flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Short note"
            className="flex-1 rounded-lg border-2 border-plum/20 bg-white/70 px-3 py-2 text-sm outline-none focus:border-plum/50"
          />
          <button
            type="button"
            onClick={addMine}
            className="rounded-lg bg-plum px-3 py-2 text-sm text-cream"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  badge,
}: {
  project: Project
  badge: string
}) {
  return (
    <li className="rounded-xl border border-plum/15 bg-cream-soft px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-plum-ink">{project.name}</p>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-lavender/50 px-2 py-0.5 text-[10px] text-plum">
            {project.status}
          </span>
          <span className="rounded-full bg-blush/40 px-2 py-0.5 text-[10px] text-plum">
            {badge}
          </span>
        </div>
      </div>
      <p className="mt-1 text-sm text-mauve">{project.note}</p>
    </li>
  )
}
