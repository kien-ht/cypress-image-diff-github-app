export type AppTheme = 'light' | 'dark' | 'system'

export type AppLayout =
  | 'default-with-header'
  | 'plain'
  | 'dashboard'
  | 'two-columns'

export type AppAccess = 'public' | 'private' | 'anyone'

export type StorageKey = 'theme'

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

export interface SelectOption<T> {
  label: string
  value: T
}
