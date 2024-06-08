import {
  createLambdaFunction,
  createProbot,
  ApplicationFunction
} from '@probot/adapter-aws-lambda-serverless'

import { appFn } from '../probot-app'
import { setupEnvVariables } from '../helpers'

setupEnvVariables()

export const handler = createLambdaFunction(
  appFn as unknown as ApplicationFunction,
  { probot: createProbot() }
)
