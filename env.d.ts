export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_ID: string
      CLIENT_SECRET: string
      DB_ACCESS_TOKENS_TABLE_NAME: string
      DB_CIRCLE_CI_TOKENS_TABLE_NAME: string
      DB_PROJECTS_TABLE_NAME: string
      DB_USERS_TABLE_NAME: string
      DB_USER_PROJECT_RELATIONS_TABLE_NAME: string
      ENCRYPTION_SECRET_KEY: string
      GITHUB_APP_DOMAIN: string
      MY_AWS_ACCESS_KEY_ID: string
      MY_AWS_REGION: string
      MY_AWS_SECRET_ACCESS_KEY: string
    }
  }
}
