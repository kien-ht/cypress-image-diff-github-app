import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'PageHome',
    meta: {
      layout: 'two-columns',
      access: 'public'
    },
    component: () => import('@/pages/PageHome.vue')
  },
  {
    path: '/github-authorized',
    name: 'PageGithubAuthorized',
    meta: {
      layout: 'plain',
      access: 'public'
    },
    component: () => import('@/pages/PageGithubAuthorized.vue')
  },
  {
    path: '/details',
    name: 'PageReportDetails',
    meta: {
      layout: 'default-with-header',
      access: 'private'
    },
    component: () => import('@/pages/PageReportDetails.vue')
  },
  {
    path: '/pipelines',
    name: 'PagePipelines',
    meta: {
      layout: 'dashboard',
      access: 'private'
    },
    component: () => import('@/pages/PagePipelines.vue')
  },
  {
    path: '/projects',
    name: 'PageProjects',
    meta: {
      layout: 'dashboard',
      access: 'private'
    },
    component: () => import('@/pages/PageProjects.vue')
  },
  {
    path: '/user',
    name: 'PageUser',
    meta: {
      layout: 'dashboard',
      access: 'private'
    },
    component: () => import('@/pages/PageUser.vue')
  },
  {
    path: '/general-settings',
    name: 'PageGeneralSettings',
    meta: {
      layout: 'dashboard',
      access: 'private'
    },
    component: () => import('@/pages/PageGeneralSettings.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'PageHome' }
  }
]
