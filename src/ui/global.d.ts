import 'vite/client'
import type { AppLayout, AppAccess } from './types'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    access?: AppAccess
    layout?: AppLayout
  }
}
