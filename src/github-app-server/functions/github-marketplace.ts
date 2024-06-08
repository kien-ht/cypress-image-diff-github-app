import { Handler } from '@netlify/functions'

import { setupEnvVariables } from '../helpers'

setupEnvVariables()

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    body: 'Hello world!'
  }
}
