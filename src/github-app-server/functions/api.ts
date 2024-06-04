import { Handler } from '@netlify/functions'

import { GithubController } from '../github-controller'
import { PATH_TO_SERVERLESS_FUNCTIONS } from '../../common/constants'
import { establishUserAccessTokenHandler } from '../handler-auth'
import {
  getReportsHandler,
  addToStagedChangesHandler,
  updateReportsHandler
} from '../handler-protected'

// Replace escaped newlines to fix this octokit bug
// Error: secretOrPrivateKey must be an asymmetric key when using RS256
// See more here https://github.com/octokit/auth-app.js/issues/465
process.env.PRIVATE_KEY = process.env.PRIVATE_KEY!.replace(/\\n/g, '\n')

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const getPublicConfigHandler: Handler = async () => {
  try {
    const controller = new GithubController()
    const config = controller.getPublicConfig()
    return {
      statusCode: 200,
      body: JSON.stringify(config)
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 400,
      // @ts-expect-error: any
      body: JSON.stringify({ message: err.message ?? err })
    }
  }
}

export const handler = redirectRoutes({
  '/api/reports/staged': {
    POST: addToStagedChangesHandler
  },
  '/api/reports': {
    GET: getReportsHandler,
    PATCH: updateReportsHandler
  },
  '/api/config': {
    GET: getPublicConfigHandler
  },
  '/api/auth': {
    GET: establishUserAccessTokenHandler
  }
  // '/api/user': {
  //   GET: getUserHandler
  // }
})

function redirectRoutes(
  routes: Record<string, Partial<Record<HttpMethod, Handler>>>
): Handler {
  return (event, context) => {
    const httpMethod = event.httpMethod as HttpMethod
    const endpoint = event.path.replace(PATH_TO_SERVERLESS_FUNCTIONS, '')

    if (routes[endpoint] && routes[endpoint][httpMethod])
      return routes[endpoint][httpMethod]!(event, context)

    return Promise.resolve({
      statusCode: 404,
      body: JSON.stringify({ message: 'Not found' })
    })
  }
}
