import { useEffect, useState } from 'react'
import { useSettings } from '../lib/settings/SettingsContext'
import { loadJson, saveJson } from '../lib/storage'

type Task = { id: string; label: string; done: boolean }

const MINE_KEY = 'mlc-tasks-mine-v1'

const NOTION_PLACEHOLDER: Task[] = [
  { id: 'n1', label: 'Ship corner HUD polish', done: false },
  { id: 'n2', label: 'Notion weekly review', done: false },
  { id: 'n3', label: 'Inbox zero (Notion)', done: true },
]

export function TasksApp() {
  const { settings, setSettingsOpen } = useSettings()
  const notionOn = settings.notion.status === 'connected'
  const [mine, setMine] = useState<Task[]>(() =>
    loadJson<Task[]>(MINE_KEY, [
      { id: '1', label: 'Water the plants', done: false },
      { id: '2', label: 'Evening walk with Louie', done: false },
    ]),
  )
  const [draft, setDraft] = useState('')
  const [notionTasks] = useState(NOTION_PLACEHOLDER)

  useEffect(() => {
    saveJson(MINE_KEY, mine)
  }, [mine])

  function toggleMine(id: string) {
    setMine((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }

  function addTask() {
    const label = draft.trim()
    if (!label) return
    setMine((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, done: false },
    ])
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div>
        <p className="font-display text-[10px] text-plum">Today</p>
        <p className="mt-1 text-xs text-mauve">
          Mine stay on this device. Notion syncs when connected in Settings.
        </p>
      </div>

      <section className="min-h-0 flex-1 space-y-3 overflow-auto">
        <div>
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
            <ul className="space-y-1">
              {notionTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 rounded-lg bg-lavender/25 px-2 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    readOnly
                    className="size-4 accent-plum"
                  />
                  <span
                    className={
                      task.done ? 'text-mauve line-through' : 'text-plum-ink'
                    }
                  >
                    {task.label}
                  </span>
                  <span className="ml-auto text-[9px] text-mauve">Notion</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-cream-soft px-2.5 py-2 text-xs text-mauve">
              Placeholder Notion tasks appear here after you connect.
            </p>
          )}
        </div>

        <div>
          <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-plum">
            My tasks
          </h3>
          <ul className="space-y-1">
            {mine.map((task) => (
              <li key={task.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-blush/30">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleMine(task.id)}
                    className="size-4 accent-plum"
                  />
                  <span
                    className={`text-sm ${task.done ? 'text-mauve line-through' : 'text-plum-ink'}`}
                  >
                    {task.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex gap-2 border-t border-plum/15 pt-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask()
          }}
          placeholder="Add my task"
          className="flex-1 rounded-lg border-2 border-plum/20 bg-white/70 px-3 py-2 text-sm outline-none focus:border-plum/50"
        />
        <button
          type="button"
          onClick={addTask}
          className="rounded-lg bg-plum px-3 py-2 text-sm text-cream"
        >
          Add
        </button>
      </div>
    </div>
  )
}
