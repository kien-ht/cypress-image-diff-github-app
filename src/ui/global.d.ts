import 'vite/client'
import type { AppLayout, AppAccess } from './types'
import type { GlobalMethods } from '@/plugins/global-methods'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    access?: AppAccess
    layout?: AppLayout
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $G: GlobalMethods
  }
}
