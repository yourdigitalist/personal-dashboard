# My Little Corner

Interactive cozy lo-fi personal dashboard. Phase 1 is a visual prototype: the room scene, day/night lighting, floating windows, and mock apps.

## Run

```bash
npm install
npm run dev
```

Open the local URL Vite prints (default `http://127.0.0.1:5173`).

## What’s in Phase 1

- Pixel-art room stage that keeps a 16:9 aspect ratio
- Top bar with greeting, motivation, live clock, and lighting override
- Icon rail + room hotspots that open the same tools
- Draggable floating windows (minimize / maximize / close / resize)
- Mock Claude chat, tasks, calendar, projects, library, focus timer, daily note

No backend, Supabase, or Anthropic calls yet. Chat goes through `src/lib/chat/mockClient.ts`.
