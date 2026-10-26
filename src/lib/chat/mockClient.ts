export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const REPLIES = [
  "I'm here with you in your little corner. What's on your mind today?",
  'That sounds doable. Want me to break it into a few calm next steps?',
  "Noted. When you're ready, we can look at your tasks or calendar together.",
  'Take a breath. One clear intention is enough for this hour.',
  "Happy to help — this is a mock reply for Phase 1. Real Claude will plug in later.",
]

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

/** Swap this for an Anthropic-backed client later. Keep keys off the client. */
export async function sendMockMessage(
  history: ChatMessage[],
  userText: string,
): Promise<ChatMessage> {
  await delay(500 + Math.random() * 700)
  const pick = REPLIES[(history.length + userText.length) % REPLIES.length]
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: pick,
  }
}
