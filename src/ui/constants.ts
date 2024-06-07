import { StorageKey } from '@/types'

export const ALL_STORAGE_KEY: Record<StorageKey, string> = {
  theme: 'theme'
}

export enum DashboardMenu {
  'Pipelines' = 'PagePipelines',
  'Projects' = 'PageProjects',
  'User' = 'PageUser',
  'Settings' = 'PageGeneralSettings'
}
