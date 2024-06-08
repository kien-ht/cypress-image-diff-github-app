import LayoutDefaultWithHeader from './LayoutDefaultWithHeader.vue'
import LayoutPlain from './LayoutPlain.vue'
import LayoutDashboard from './LayoutDashboard.vue'
import LayoutTwoColumns from './LayoutTwoColumns.vue'
import type { AppLayout } from '@/types'

export const layoutMap: Record<AppLayout, Component> = {
  'default-with-header': LayoutDefaultWithHeader,
  plain: LayoutPlain,
  dashboard: LayoutDashboard,
  'two-columns': LayoutTwoColumns
}
