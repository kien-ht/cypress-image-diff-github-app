import { defineStore } from 'pinia'
import { getReports, getPublicConfig } from '@/service'
import { TestInStagedChange, ResolvedReport, PublicConfig } from '@commonTypes'

interface MainStoreState {
  report?: ResolvedReport
  isLoadingReport: boolean
  selectedTests: Map<string, TestInStagedChange[]>
  publicConfig?: PublicConfig
  hasLoggedIn: boolean
}

export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    report: undefined,
    isLoadingReport: false,
    selectedTests: new Map<string, TestInStagedChange[]>(),
    publicConfig: undefined,
    hasLoggedIn: false
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
    }
  }
})
