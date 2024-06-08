import { defineStore } from 'pinia'
import { getReports, getPublicConfig, getUser } from '@/service'
import {
  TestInStagedChange,
  ResolvedReport,
  PublicConfig,
  User,
  Project
} from '@commonTypes'

export interface SetStateOptions {
  replace?: boolean
  throwError?: boolean
}

interface MainStoreState {
  report?: ResolvedReport
  isLoadingReport: boolean
  selectedTests: Map<string, TestInStagedChange[]>
  publicConfig?: PublicConfig
  hasSignedIn: boolean
  user?: User
  projects: Project[]
}

export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    report: undefined,
    isLoadingReport: false,
    selectedTests: new Map<string, TestInStagedChange[]>(),
    publicConfig: undefined,
    hasSignedIn: false,
    user: undefined,
    projects: []
  }),

  getters: {
    displayReport: (state): ResolvedReport | undefined =>
      state.report
        ? {
            ...state.report,
            suites:
              state.report?.suites.map((suite) => ({
                ...suite,
                tests: suite.tests.map((test) => ({
                  ...test,
                  baselineDataUrl: test.baselineDataUrl ?? test.baselinePath,
                  diffDataUrl: test.diffDataUrl ?? test.diffPath,
                  comparisonDataUrl:
                    test.comparisonDataUrl ?? test.comparisonPath
                }))
              })) ?? []
          }
        : undefined,
    selectedTestsFlatten: (state): TestInStagedChange[] =>
      Array.from(state.selectedTests.values()).flat(),

    selectedTestsFlattenMap: function (): Map<string, TestInStagedChange> {
      return this.selectedTestsFlatten.reduce((map, item) => {
        map.set(item.baselinePath, item)
        return map
      }, new Map())
    }
  },

  actions: {
    async fetchReport(artifactsUrl?: string) {
      this.isLoadingReport = true
      try {
        this.report = await getReports(artifactsUrl)
      } catch (err) {
        Promise.reject(err)
      }
      this.isLoadingReport = false
    },

    async fetchPublicConfig() {
      try {
        this.publicConfig = await getPublicConfig()
      } catch (err) {
        Promise.reject(err)
      }
    },

    async fetchUser({
      replace = false,
      throwError = true
    }: SetStateOptions = {}) {
      if (this.user && replace === false) return

      try {
        this.user = await getUser()
      } catch (err) {
        throwError && Promise.reject(err)
      }
    },

    async fetchProjects({ replace = false }: SetStateOptions = {}) {
      if (this.projects.length && replace === false) return

      this.projects = [
        {
          name: 'My first project',
          repositoryId: 312321,
          owner: 'octokat',
          id: '3124',
          description: 'This is just an example',
          url: 'https://github.com/octocat/Hello-World',
          settings: {
            envs: [
              {
                key: 'CIRCLE_CI_TEST',
                value: 'ajcij3ioj2313912c',
                createdAt: '2024-06-03T14:29:38.000Z'
              },
              {
                key: 'CIRCLE_CI_DEMO',
                value: 'cdsv252ethgf',
                createdAt: '2024-06-03T17:03:19.000Z'
              }
            ]
          }
        },
        {
          name: 'My second project',
          repositoryId: 123,
          owner: 'octocat',
          id: '123343',
          description: 'This is just an example',
          url: 'https://github.com/octocat/Hello-World',
          settings: {
            envs: [
              {
                key: '2_CIRCLE_CI_TEST',
                value: '3f31fcxbvx',
                createdAt: '2024-06-03T14:29:38.000Z'
              },
              {
                key: '2_CIRCLE_CI_DEMO',
                value: 'cdsv252efafthgf',
                createdAt: '2024-06-03T14:29:38.000Z'
              }
            ]
          }
        }
      ]
    }
  }
})
