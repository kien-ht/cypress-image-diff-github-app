import { Report, ResolvedReport } from './types.js'

export function getReportJsonWithTotalStats(json: Report): ResolvedReport {
  return {
    ...json,
    suites: json.suites
      .map((suite) => ({
        ...suite,
        tests: suite.tests.map((test) => ({
          ...test,
          passed: test.status === 'pass' ? 1 : 0,
          failed: test.status === 'fail' ? 1 : 0
        }))
      }))
      .map((suite) => ({
        ...suite,
        id: suite.path,
        passed: suite.tests.reduce((s, i) => s + i.passed, 0),
        failed: suite.tests.reduce((s, i) => s + i.failed, 0)
      }))
  }
}
