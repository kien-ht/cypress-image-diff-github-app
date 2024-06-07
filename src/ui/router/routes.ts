import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'PageHome',
    meta: {
      layout: 'plain'
    },
    component: () => import('@/pages/PageHome.vue')
  },
  {
    path: '/github-login',
    name: 'PageGithubLogin',
    component: () => import('@/pages/PageGithubLogin.vue')
  },
  {
    path: '/user',
    name: 'PageUser',
    component: () => import('@/pages/PageUser.vue')
  },
  {
    path: '/details',
    name: 'PageReportDetails',
    component: () => import('@/pages/PageReportDetails.vue')
  },
  {
    path: '/dashboard',
    name: 'PageDashboard',
    component: () => import('@/pages/PageDashboard.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'PageHome' }
  }
]
