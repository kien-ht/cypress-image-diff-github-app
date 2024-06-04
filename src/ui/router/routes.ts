import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'PageHome',
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
    name: 'PageDetails',
    component: () => import('@/pages/PageDetails.vue')
  },
  {
    path: '/circle-ci-setup',
    name: 'PageCircleCiSetup',
    component: () => import('@/pages/PageCircleCiSetup.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'PageHome' }
  }
]
