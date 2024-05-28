import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'PageHome',
    component: () => import('@/pages/PageHome.vue')
  },
  {
    path: '/details',
    name: 'PageDetails',
    component: () => import('@/pages/PageDetails.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'PageHome' }
  }
]
