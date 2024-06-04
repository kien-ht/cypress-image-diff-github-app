import { StorageKey } from '@/types'

export const ALL_STORAGE_KEY: Record<StorageKey, string> = {
  theme: 'theme'
}

export enum DashboardMenu {
  'Projects' = 'projects',
  'User' = 'user',
  'Settings' = 'general-settings'
}
