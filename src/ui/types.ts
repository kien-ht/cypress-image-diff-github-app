export enum TabValue {
  Details = 'Details',
  Settings = 'Settings'
}

export type AppTheme = 'light' | 'dark' | 'system'

export type StorageKey = 'theme' | 'token'

export interface RadioWithThumbnailOption<T> {
  thumbnail: string
  label: string
  value: T
}

export type ViewComparisonMode = 'carousel' | 'slider' | 'mirror'

export type ScreenshotType = 'baseline' | 'diff' | 'comparison'

export interface Screenshot {
  type: ScreenshotType
  url: string
}
