import { RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useScene } from '../context/SceneContext'
import { useSettings } from '../lib/settings/SettingsContext'

function fillPrompt(
  template: string,
  vars: { timeOfDay: string; greeting: string; date: string },
) {
  return template
    .replaceAll('{{timeOfDay}}', vars.timeOfDay)
    .replaceAll('{{greeting}}', vars.greeting)
    .replaceAll('{{date}}', vars.date)
}

/** Daily note — prompt in Settings; Claude generation when API is wired. */
export function MotivationApp() {
  const { motivation, timeOfDay, greeting, now } = useScene()
  const { settings, setSettingsOpen } = useSettings()
  const [note, setNote] = useState(motivation)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setNote(motivation)
  }, [motivation])

  const dateLabel = useMemo(
    () =>
      now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [now],
  )

  const filledPrompt = useMemo(
    () =>
      fillPrompt(settings.dailyNotePrompt, {
        timeOfDay,
        greeting,
        date: dateLabel,
      }),
    [settings.dailyNotePrompt, timeOfDay, greeting, dateLabel],
  )

  async function regenerate() {
    setBusy(true)
    try {
      // Until Claude API is wired, rotate the local seed note + show prompt is ready
      await new Promise((r) => setTimeout(r, 400))
      setNote(motivation)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 p-1">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-mauve">{timeOfDay}</p>
        <p className="mt-1 font-display text-sm leading-relaxed text-plum">
          {greeting}
        </p>
      </div>

      <p className="text-lg leading-snug text-plum-ink">{note}</p>

      <div className="mt-auto space-y-2 border-t border-plum/15 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-mauve">
            Claude prompt
          </p>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="text-[10px] text-plum underline"
          >
            Edit in Settings
          </button>
        </div>
        <pre className="max-h-24 overflow-auto rounded-lg bg-cream-soft p-2 font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-mauve">
          {filledPrompt}
        </pre>
        <button
          type="button"
          disabled={busy}
          onClick={() => void regenerate()}
          className="inline-flex items-center gap-2 rounded-xl bg-plum px-3 py-2 text-xs text-cream disabled:opacity-50"
        >
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
          {settings.claude.status === 'connected'
            ? 'Generate with Claude'
            : 'Refresh local note'}
        </button>
        {settings.claude.status !== 'connected' && (
          <p className="text-[10px] text-mauve">
            Connect Claude in Settings to generate a fresh note from this prompt
            each day.
          </p>
        )}
      </div>
    </div>
  )
}
