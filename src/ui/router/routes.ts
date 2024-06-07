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
    path: '/github-oauth',
    name: 'PageGithubSignUp',
    component: () => import('@/pages/PageGithubSignUp.vue')
  },
  {
    path: '/details',
    name: 'PageReportDetails',
    component: () => import('@/pages/PageReportDetails.vue')
  },
  {
    path: '/pipelines',
    name: 'PagePipelines',
    meta: {
      layout: 'dashboard'
    },
    component: () => import('@/pages/PagePipelines.vue')
  },
  {
    path: '/projects',
    name: 'PageProjects',
    meta: {
      layout: 'dashboard'
    },
    component: () => import('@/pages/PageProjects.vue')
  },
  {
    path: '/user',
    name: 'PageUser',
    meta: {
      layout: 'dashboard'
    },
    component: () => import('@/pages/PageUser.vue')
  },
  {
    path: '/general-settings',
    name: 'PageGeneralSettings',
    meta: {
      layout: 'dashboard'
    },
    component: () => import('@/pages/PageGeneralSettings.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'PageHome' }
  }
]
