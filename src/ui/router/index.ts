import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

import { routes } from './routes'
import { useMainStore } from '../store'

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.access === 'private') {
    try {
      const mainStore = useMainStore()
      await mainStore.fetchUser()
    } catch (err) {
      ElMessage({
        type: 'error',
        message: (err as Error).message
      })
    }
  }
  next()
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.access === 'anyone') return next()

  const mainStore = useMainStore()
  if (!mainStore.hasSignedIn)
    return to.meta.access === 'private' ? next({ name: 'PageHome' }) : next()

  return to.meta.access === 'public' ? next({ name: 'PageProjects' }) : next()
})

export default router
