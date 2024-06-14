import { defineStore } from 'pinia'
import {
  getPublicConfig,
  getUser,
  getProjects,
  getPipelineByPipelineId
} from '@/service'
import {
  TestInStagedChange,
  ResolvedReport,
  PublicConfig,
  User,
  Project
} from '@commonTypes'

export interface SetStateOptions<T = any> {
  data?: T
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
  projects?: Project[]
  isLoadingProjects: boolean
}

export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    report: undefined,
    isLoadingReport: false,
    selectedTests: new Map<string, TestInStagedChange[]>(),
    publicConfig: undefined,
    hasSignedIn: false,
    user: undefined,
    projects: undefined,
    isLoadingProjects: false
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
    async fetchReport(pipelineId: string) {
      this.isLoadingReport = true
      try {
        const { report } = await getPipelineByPipelineId(pipelineId)
        this.report = report
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

    async fetchProjects({
      data,
      replace = false,
      throwError = true
    }: SetStateOptions<Project[]> = {}) {
      if (data) {
        return (this.projects = data)
      }

      if (this.projects?.length && replace === false) return

      this.isLoadingProjects = true
      try {
        this.projects = await getProjects()
      } catch (err) {
        throwError && Promise.reject(err)
      }
      this.isLoadingProjects = false
    }
  }
})
