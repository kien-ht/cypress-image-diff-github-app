import { defineStore } from 'pinia'
import { getReports } from '@/service'
import { WorkflowInstance, ResolvedTest, ResolvedReport } from '@commonTypes'

interface MainStoreState {
  report?: ResolvedReport
  isLoadingReport: boolean
  selectedTests: Map<string, ResolvedTest[]>
}

export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    report: undefined,
    isLoadingReport: false,
    selectedTests: new Map<string, ResolvedTest[]>()
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
    selectedTestsFlatten: (state): ResolvedTest[] =>
      Array.from(state.selectedTests.values()).flat()
  },

  actions: {
    async fetchReport(instance?: WorkflowInstance) {
      this.isLoadingReport = true
      try {
        this.report = await getReports(instance)
      } catch (err) {
        Promise.reject(err)
      }
      this.isLoadingReport = false
    }
  }
})
