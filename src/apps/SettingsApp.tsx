import { useSettings } from '../lib/settings/SettingsContext'
import { DEFAULT_DAILY_NOTE_PROMPT } from '../lib/settings/types'

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] ${
        connected ? 'bg-forest/20 text-forest' : 'bg-mauve/20 text-mauve'
      }`}
    >
      {connected ? 'Connected' : 'Not connected'}
    </span>
  )
}

export function SettingsApp() {
  const { settings, setSettings } = useSettings()

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto text-sm text-plum-ink">
      <p className="text-xs text-mauve">
        Connections stay in this browser. Real OAuth / API calls land next —
        paste keys where noted so the UI is ready.
      </p>

      <section className="space-y-2 rounded-xl border border-plum/15 bg-cream-soft p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">Claude</h3>
          <StatusPill connected={settings.claude.status === 'connected'} />
        </div>
        <p className="text-xs text-mauve">
          Powers chat + daily note. Your Claude shell shows recent conversations
          once connected.
        </p>
        <label className="block text-xs text-mauve">
          Anthropic API key
          <input
            type="password"
            autoComplete="off"
            value={settings.claude.apiKey}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                claude: {
                  ...s.claude,
                  apiKey: e.target.value,
                  status: e.target.value.trim() ? 'connected' : 'disconnected',
                },
              }))
            }
            placeholder="sk-ant-…"
            className="mt-1 w-full rounded-lg border border-plum/20 bg-white/80 px-2.5 py-1.5 text-sm outline-none focus:border-plum/45"
          />
        </label>
      </section>

      <section className="space-y-2 rounded-xl border border-plum/15 bg-cream-soft p-3">
        <h3 className="font-medium">Calendars</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-plum px-3 py-1.5 text-xs text-cream"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                googleCalendar: {
                  status:
                    s.googleCalendar.status === 'connected'
                      ? 'disconnected'
                      : 'connected',
                },
              }))
            }
          >
            {settings.googleCalendar.status === 'connected'
              ? 'Disconnect Google'
              : 'Connect Google Calendar'}
          </button>
          <button
            type="button"
            className="rounded-lg border border-plum/25 px-3 py-1.5 text-xs text-plum"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                microsoftCalendar: {
                  status:
                    s.microsoftCalendar.status === 'connected'
                      ? 'disconnected'
                      : 'connected',
                },
              }))
            }
          >
            {settings.microsoftCalendar.status === 'connected'
              ? 'Disconnect Microsoft'
              : 'Connect Microsoft Calendar'}
          </button>
        </div>
        <p className="text-xs text-mauve">
          OAuth wiring next. Buttons toggle UI state for now so Calendar can show
          both sources.
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-plum/15 bg-cream-soft p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">Notion</h3>
          <StatusPill connected={settings.notion.status === 'connected'} />
        </div>
        <label className="block text-xs text-mauve">
          Integration token
          <input
            type="password"
            value={settings.notion.token}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                notion: {
                  ...s.notion,
                  token: e.target.value,
                  status: e.target.value.trim() ? 'connected' : 'disconnected',
                },
              }))
            }
            placeholder="secret_…"
            className="mt-1 w-full rounded-lg border border-plum/20 bg-white/80 px-2.5 py-1.5 text-sm outline-none focus:border-plum/45"
          />
        </label>
        <label className="block text-xs text-mauve">
          Tasks database ID
          <input
            value={settings.notion.tasksDatabaseId}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                notion: { ...s.notion, tasksDatabaseId: e.target.value },
              }))
            }
            className="mt-1 w-full rounded-lg border border-plum/20 bg-white/80 px-2.5 py-1.5 text-sm outline-none focus:border-plum/45"
          />
        </label>
        <label className="block text-xs text-mauve">
          Projects database ID
          <input
            value={settings.notion.projectsDatabaseId}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                notion: { ...s.notion, projectsDatabaseId: e.target.value },
              }))
            }
            className="mt-1 w-full rounded-lg border border-plum/20 bg-white/80 px-2.5 py-1.5 text-sm outline-none focus:border-plum/45"
          />
        </label>
      </section>

      <section className="space-y-2 rounded-xl border border-plum/15 bg-cream-soft p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">Daily note prompt</h3>
          <button
            type="button"
            className="text-[10px] text-plum underline"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                dailyNotePrompt: DEFAULT_DAILY_NOTE_PROMPT,
              }))
            }
          >
            Reset
          </button>
        </div>
        <textarea
          value={settings.dailyNotePrompt}
          onChange={(e) =>
            setSettings((s) => ({ ...s, dailyNotePrompt: e.target.value }))
          }
          rows={8}
          className="w-full resize-y rounded-lg border border-plum/20 bg-white/80 px-2.5 py-2 font-mono text-[11px] leading-relaxed outline-none focus:border-plum/45"
        />
        <p className="text-[10px] text-mauve">
          Placeholders: {'{{timeOfDay}}'}, {'{{greeting}}'}, {'{{date}}'}
        </p>
      </section>
    </div>
  )
}
