import { UserConfig } from './types.js'

export const DEFAULT_CONFIG_PATH = 'cypress-image-diff-html-report.config.js'

export const DEFAULT_PORT = 6868

export const DEFAULT_CONFIG: UserConfig = {
  reportJsonDir: 'cypress-image-diff-html-report',
  reportJsonFilePath: undefined,
  outputDir: 'cypress-image-diff-html-report',
  baseDir: '',
  inlineAssets: false,
  autoOpen: false,
  serverPort: DEFAULT_PORT
}

export const GITHUB_APP_NAME = 'cypress-image-diff'

export const CIRCLE_CI_CONTEXT_NAME = 'ci/circleci: visual-test'

export const PATH_TO_SERVERLESS_FUNCTIONS = '/.netlify/functions'
