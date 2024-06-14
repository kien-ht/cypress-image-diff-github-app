import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

import { routes } from './routes'
import { useMainStore } from '../store'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  try {
    // need to fetch user info for every route to justify if user has logged in
    const mainStore = useMainStore()
    await mainStore.fetchUser({ throwError: to.meta.access === 'private' })
  } catch (err) {
    ElMessage({
      type: 'error',
      message: (err as Error).message
    })
  }
  next()
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.access === 'anyone') return next()

  const mainStore = useMainStore()
  if (!mainStore.hasSignedIn)
    return to.meta.access === 'private'
      ? next({ name: 'PageHome', query: { returnTo: to.fullPath } })
      : next()

  return to.meta.access === 'public' ? next({ name: 'PageProjects' }) : next()
})

export default router
