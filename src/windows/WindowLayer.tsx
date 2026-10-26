import type { ComponentType } from 'react'
import { CalendarApp } from '../apps/CalendarApp'
import { ClaudeChat } from '../apps/ClaudeChat'
import { FocusApp } from '../apps/FocusApp'
import { LibraryApp } from '../apps/LibraryApp'
import { LouieApp } from '../apps/LouieApp'
import { MotivationApp } from '../apps/MotivationApp'
import { MusicApp } from '../apps/MusicApp'
import { ProjectsApp } from '../apps/ProjectsApp'
import { SettingsApp } from '../apps/SettingsApp'
import { TasksApp } from '../apps/TasksApp'
import type { AppId } from '../types'
import { FloatingWindow } from './FloatingWindow'
import { useWindows } from './WindowProvider'

const CONTENT: Record<AppId, ComponentType> = {
  claude: ClaudeChat,
  calendar: CalendarApp,
  tasks: TasksApp,
  projects: ProjectsApp,
  library: LibraryApp,
  focus: FocusApp,
  motivation: MotivationApp,
  music: MusicApp,
  settings: SettingsApp,
  louie: LouieApp,
}

export function WindowLayer() {
  const { windows } = useWindows()
  const ids = Object.keys(CONTENT) as AppId[]

  return (
    <>
      {ids.map((id) => {
        const Content = CONTENT[id]
        return (
          <FloatingWindow key={id} win={windows[id]}>
            <Content />
          </FloatingWindow>
        )
      })}
    </>
  )
}
