import LayoutDefaultWithHeader from './LayoutDefaultWithHeader.vue'
import LayoutPlain from './LayoutPlain.vue'
import type { AppLayout } from '@/types'

export const layoutMap: Record<AppLayout, Component> = {
  'default-with-header': LayoutDefaultWithHeader,
  plain: LayoutPlain
}
