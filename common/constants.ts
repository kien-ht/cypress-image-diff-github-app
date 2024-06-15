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

export const CIRCLE_CI_JOB_NAME = 'visual-test'

export const CIRCLE_CI_CONTEXT_NAME = `ci/circleci: ${CIRCLE_CI_JOB_NAME}`

export const PATH_TO_SERVERLESS_FUNCTIONS = '/.netlify/functions'

export const USER_ACCESS_TOKEN_EXPIRATION_TIME = 30 * 24 * 60 * 60

export const CIRCLE_CI_PROJECT_TOKEN_KEY = 'CIRCLE_CI_CYPRESS_IMAGE_DIFF_TOKEN'
