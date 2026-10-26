import { MessageSquarePlus, Paperclip, Send } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { sendMockMessage, type ChatMessage } from '../lib/chat/mockClient'
import { useSettings } from '../lib/settings/SettingsContext'

type Conversation = {
  id: string
  title: string
  preview: string
  updatedAt: string
  messages: ChatMessage[]
}

const SEED: Conversation[] = [
  {
    id: 'c1',
    title: 'Corner dashboard ideas',
    preview: 'How can I help you today?',
    updatedAt: 'Today',
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'How can I help you today?',
      },
    ],
  },
  {
    id: 'c2',
    title: 'Weekly focus plan',
    preview: 'Three deep-work blocks…',
    updatedAt: 'Yesterday',
    messages: [
      {
        id: 'a1',
        role: 'assistant',
        content:
          'Here is a gentle weekly focus plan with three deep-work blocks and soft buffers.',
      },
    ],
  },
  {
    id: 'c3',
    title: 'Louie care reminders',
    preview: 'Walks, water, quiet time…',
    updatedAt: 'Mon',
    messages: [
      {
        id: 'a2',
        role: 'assistant',
        content: 'A simple Louie care rhythm: morning walk, midday water check, evening calm.',
      },
    ],
  },
]

function renderLightMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-blush/40 px-1 py-0.5 text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={index}>{part}</span>
  })
}

/** Claude shell — recent conversations + chat. Live API via Settings gear. */
export function ClaudeChat() {
  const { settings, setSettingsOpen } = useSettings()
  const connected = settings.claude.status === 'connected'
  const [conversations, setConversations] = useState(SEED)
  const [activeId, setActiveId] = useState(SEED[0].id)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId],
  )

  function newChat() {
    const id = crypto.randomUUID()
    const conv: Conversation = {
      id,
      title: 'New chat',
      preview: 'How can I help you today?',
      updatedAt: 'Now',
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'How can I help you today?',
        },
      ],
    }
    setConversations((prev) => [conv, ...prev])
    setActiveId(id)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || busy || !active) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    const withUser = [...active.messages, userMsg]
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              title: c.title === 'New chat' ? text.slice(0, 36) : c.title,
              preview: text.slice(0, 48),
              updatedAt: 'Now',
              messages: withUser,
            }
          : c,
      ),
    )
    setDraft('')
    setBusy(true)
    try {
      const reply = await sendMockMessage(withUser, text)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? {
                ...c,
                preview: reply.content.slice(0, 48),
                messages: [...c.messages, reply],
              }
            : c,
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 gap-2">
      <aside className="flex w-[38%] min-w-[7.5rem] flex-col rounded-xl bg-cream-soft/80">
        <div className="flex items-center justify-between gap-1 border-b border-plum/10 px-2 py-2">
          <p className="font-display text-[8px] text-plum">Chats</p>
          <button
            type="button"
            aria-label="New chat"
            onClick={newChat}
            className="rounded-lg p-1 text-plum hover:bg-blush/40"
          >
            <MessageSquarePlus size={14} />
          </button>
        </div>
        <ul className="flex-1 space-y-0.5 overflow-auto p-1">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`w-full rounded-lg px-2 py-2 text-left transition ${
                  c.id === activeId
                    ? 'bg-plum/15 text-plum-ink'
                    : 'text-mauve hover:bg-cream'
                }`}
              >
                <p className="truncate text-[11px] font-medium">{c.title}</p>
                <p className="truncate text-[10px] opacity-70">{c.preview}</p>
              </button>
            </li>
          ))}
        </ul>
        {!connected && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="m-1 rounded-lg bg-plum/10 px-2 py-1.5 text-[10px] text-plum hover:bg-plum/15"
          >
            Connect Claude in Settings
          </button>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex-1 space-y-2 overflow-auto pr-1">
          {active?.messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                message.role === 'assistant'
                  ? 'bg-cream-soft text-plum-ink'
                  : 'ml-auto bg-plum text-cream'
              }`}
            >
              {renderLightMarkdown(message.content)}
            </div>
          ))}
          {busy && (
            <p className="text-xs text-mauve">Claude is thinking…</p>
          )}
        </div>

        <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-plum/15 pt-2">
          <button
            type="button"
            aria-label="Attach (soon)"
            className="rounded-lg p-2 text-mauve hover:bg-blush/30"
            disabled
          >
            <Paperclip size={16} />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder={
              connected
                ? 'Message Claude…'
                : 'Mock replies until Claude is connected in Settings'
            }
            className="flex-1 resize-none rounded-xl border-2 border-plum/20 bg-white/70 px-3 py-2 text-sm outline-none focus:border-plum/45"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void onSubmit(e as unknown as FormEvent)
              }
            }}
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label="Send"
            className="rounded-xl bg-plum p-2.5 text-cream disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
