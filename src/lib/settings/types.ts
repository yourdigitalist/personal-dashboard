export type ConnectionStatus = 'disconnected' | 'connected' | 'error'

export type AppSettings = {
  claude: {
    status: ConnectionStatus
    /** User pastes Anthropic API key locally (never sent except to Anthropic). */
    apiKey: string
  }
  googleCalendar: { status: ConnectionStatus }
  microsoftCalendar: { status: ConnectionStatus }
  notion: {
    status: ConnectionStatus
    /** Integration token — used later for Tasks/Projects sync */
    token: string
    tasksDatabaseId: string
    projectsDatabaseId: string
  }
  dailyNotePrompt: string
}

export const DEFAULT_DAILY_NOTE_PROMPT = `You are writing a short daily note for Marina's cozy personal dashboard ("My Little Corner").

Tone: warm, grounded, gently motivating — like a friend who also respects focus time. No hype, no corporate speak.

Context:
- Time of day lighting: {{timeOfDay}}
- Greeting mood: {{greeting}}
- Date: {{date}}

Write 1–2 sentences (max ~40 words) she can glance at on the mug / daily note window. Make it unique to today.`

export const DEFAULT_SETTINGS: AppSettings = {
  claude: { status: 'disconnected', apiKey: '' },
  googleCalendar: { status: 'disconnected' },
  microsoftCalendar: { status: 'disconnected' },
  notion: {
    status: 'disconnected',
    token: '',
    tasksDatabaseId: '',
    projectsDatabaseId: '',
  },
  dailyNotePrompt: DEFAULT_DAILY_NOTE_PROMPT,
}

export const SETTINGS_STORAGE_KEY = 'mlc-settings-v1'
