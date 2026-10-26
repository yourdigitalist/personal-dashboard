import type { AppId, WindowState } from '../types'

export const APP_TITLES: Record<AppId, string> = {
  claude: 'Claude',
  calendar: 'Calendar',
  tasks: 'Tasks',
  projects: 'Projects',
  library: 'Library',
  focus: 'Focus',
  motivation: 'Daily note',
  music: 'Focus radio',
  settings: 'Settings',
  louie: 'Louie',
}

const DEFAULTS: Record<
  AppId,
  Pick<WindowState, 'x' | 'y' | 'width' | 'height'>
> = {
  claude: { x: 420, y: 180, width: 420, height: 460 },
  calendar: { x: 640, y: 90, width: 360, height: 380 },
  tasks: { x: 120, y: 100, width: 320, height: 360 },
  projects: { x: 180, y: 150, width: 380, height: 400 },
  library: { x: 240, y: 120, width: 360, height: 420 },
  focus: { x: 460, y: 220, width: 300, height: 280 },
  motivation: { x: 360, y: 260, width: 320, height: 220 },
  music: { x: 520, y: 240, width: 300, height: 340 },
  settings: { x: 280, y: 100, width: 380, height: 480 },
  louie: { x: 380, y: 280, width: 280, height: 300 },
}

export const WINDOWS_STORAGE_KEY = 'mlc-windows-v1'

export function createInitialWindows(): Record<AppId, WindowState> {
  const ids = Object.keys(APP_TITLES) as AppId[]
  return Object.fromEntries(
    ids.map((id, index) => [
      id,
      {
        id,
        title: APP_TITLES[id],
        open: false,
        minimized: false,
        maximized: false,
        zIndex: 10 + index,
        ...DEFAULTS[id],
      },
    ]),
  ) as Record<AppId, WindowState>
}

export function loadWindows(): Record<AppId, WindowState> {
  const base = createInitialWindows()
  try {
    const raw = localStorage.getItem(WINDOWS_STORAGE_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<Record<AppId, WindowState>>
    for (const id of Object.keys(base) as AppId[]) {
      const s = saved[id]
      if (!s) continue
      base[id] = {
        ...base[id],
        open: Boolean(s.open),
        minimized: Boolean(s.minimized),
        maximized: Boolean(s.maximized),
        x: Number.isFinite(s.x) ? s.x : base[id].x,
        y: Number.isFinite(s.y) ? s.y : base[id].y,
        width: Number.isFinite(s.width) ? Math.max(260, s.width) : base[id].width,
        height: Number.isFinite(s.height)
          ? Math.max(180, s.height)
          : base[id].height,
        zIndex: Number.isFinite(s.zIndex) ? s.zIndex : base[id].zIndex,
      }
    }
  } catch {
    /* keep defaults */
  }
  return base
}

export function saveWindows(windows: Record<AppId, WindowState>) {
  localStorage.setItem(WINDOWS_STORAGE_KEY, JSON.stringify(windows))
}

/** Neat cascade / grid for currently open (non-minimized) windows. */
export function computeTidyLayout(
  windows: Record<AppId, WindowState>,
): Record<AppId, Partial<WindowState>> {
  const openIds = (Object.keys(windows) as AppId[]).filter(
    (id) => windows[id].open && !windows[id].minimized,
  )
  const patch: Record<string, Partial<WindowState>> = {}
  if (openIds.length === 0) return patch

  const marginX = 72
  const marginY = 72
  const gap = 16
  const cols = Math.min(3, openIds.length)
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
  const usableW = Math.max(640, viewportW - marginX * 2 - 56)
  const cellW = Math.floor((usableW - gap * (cols - 1)) / cols)
  const cellH = Math.min(
    420,
    Math.floor((viewportH - marginY - 48 - gap * 2) / Math.ceil(openIds.length / cols)),
  )

  openIds.forEach((id, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const w = Math.min(windows[id].width, Math.max(280, cellW))
    const h = Math.min(windows[id].height, Math.max(220, cellH))
    patch[id] = {
      x: marginX + col * (cellW + gap),
      y: marginY + row * (cellH + gap),
      width: w,
      height: h,
      maximized: false,
      minimized: false,
      zIndex: 30 + i,
    }
  })

  return patch as Record<AppId, Partial<WindowState>>
}
