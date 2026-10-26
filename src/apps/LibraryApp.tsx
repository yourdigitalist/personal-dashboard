import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadJson, saveJson } from '../lib/storage'

type Entry = {
  id: string
  title: string
  kind: string
  tag: string
}

const KEY = 'mlc-library-v1'

const DEFAULTS: Entry[] = [
  {
    id: '1',
    title: 'Deep Work',
    kind: 'Book',
    tag: 'Focus',
  },
  {
    id: '2',
    title: 'Morning pages habit',
    kind: 'Note',
    tag: 'Ritual',
  },
  {
    id: '3',
    title: 'Pixel lighting references',
    kind: 'Collection',
    tag: 'Art',
  },
]

/** Quiet shelf — fully editable, stored locally. */
export function LibraryApp() {
  const [entries, setEntries] = useState<Entry[]>(() =>
    loadJson(KEY, DEFAULTS),
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ title: '', kind: 'Note', tag: '' })

  useEffect(() => {
    saveJson(KEY, entries)
  }, [entries])

  function startEdit(entry: Entry) {
    setEditingId(entry.id)
    setDraft({ title: entry.title, kind: entry.kind, tag: entry.tag })
  }

  function saveEdit() {
    if (!editingId || !draft.title.trim()) return
    setEntries((prev) =>
      prev.map((e) =>
        e.id === editingId
          ? {
              ...e,
              title: draft.title.trim(),
              kind: draft.kind.trim() || 'Note',
              tag: draft.tag.trim() || 'General',
            }
          : e,
      ),
    )
    setEditingId(null)
  }

  function addEntry() {
    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        title: 'Untitled',
        kind: 'Note',
        tag: 'New',
      },
      ...prev,
    ])
  }

  function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (editingId === id) setEditingId(null)
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-mauve">
          Books, notes, ideas — edit freely. Saved in this browser.
        </p>
        <button
          type="button"
          onClick={addEntry}
          className="inline-flex items-center gap-1 rounded-lg bg-plum px-2.5 py-1.5 text-xs text-cream"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <ul className="min-h-0 flex-1 space-y-2 overflow-auto">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl bg-cream-soft px-3 py-3"
          >
            {editingId === entry.id ? (
              <div className="space-y-2">
                <input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                  className="w-full rounded-lg border border-plum/20 bg-white/80 px-2 py-1.5 text-sm outline-none"
                  placeholder="Title"
                />
                <div className="flex gap-2">
                  <input
                    value={draft.kind}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, kind: e.target.value }))
                    }
                    className="w-1/2 rounded-lg border border-plum/20 bg-white/80 px-2 py-1.5 text-xs outline-none"
                    placeholder="Kind"
                  />
                  <input
                    value={draft.tag}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, tag: e.target.value }))
                    }
                    className="w-1/2 rounded-lg border border-plum/20 bg-white/80 px-2 py-1.5 text-xs outline-none"
                    placeholder="Tag"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="rounded-lg bg-plum px-3 py-1 text-xs text-cream"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg px-3 py-1 text-xs text-mauve"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-plum-ink">
                    {entry.title}
                  </p>
                  <p className="text-xs text-mauve">{entry.kind}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-md bg-blush/50 px-2 py-0.5 text-[11px] text-plum">
                    {entry.tag}
                  </span>
                  <button
                    type="button"
                    aria-label={`Edit ${entry.title}`}
                    onClick={() => startEdit(entry)}
                    className="rounded-lg p-1.5 text-plum hover:bg-blush/40"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${entry.title}`}
                    onClick={() => remove(entry.id)}
                    className="rounded-lg p-1.5 text-mauve hover:bg-blush/40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
