import {
  Handler,
  HandlerEvent,
  HandlerContext,
  HandlerResponse
} from '@netlify/functions'

import { PATH_TO_SERVERLESS_FUNCTIONS } from '../../common/constants'
import { signInHandler, signUpHandler } from '../handler-auth'
import {
  addToStagedChangesHandler,
  updateReportsHandler,
  getUserHandler,
  getUserProjectsHandler,
  syncProjectsWithGithubHandler,
  signOutHandler,
  updateProjectSettingsHandler,
  getPipelineHandler,
  getPipelineListHandler
} from '../handler-protected'
import { getPublicConfigHandler } from '../handler-public'
import { decrypt, getCookie, setupEnvVariables } from '../helpers'
import { dynamoDb } from '../dynamo-db'
import { ApiRouteAccess } from '../../common/types'

setupEnvVariables()

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RouteMiddleware = (
  event: HandlerEvent,
  context: HandlerContext,
  next: Handler,
  access: ApiRouteAccess
) => Promise<HandlerResponse>

type RouteConfig = {
  handler: Handler
  access: ApiRouteAccess
}

type RouteHandler = Partial<Record<HttpMethod, Handler | RouteConfig>>

export const handler = redirectRoutes(
  {
    '/api/reports/staged': {
      POST: addToStagedChangesHandler
    },
    '/api/reports': {
      PATCH: updateReportsHandler
    },
    '/api/config': {
      GET: {
        handler: getPublicConfigHandler,
        access: 'public'
      }
    },
    '/api/sign-in': {
      POST: {
        handler: signInHandler,
        access: 'public'
      }
    },
    '/api/sign-up': {
      POST: {
        handler: signUpHandler,
        access: 'public'
      }
    },
    '/api/user': {
      GET: getUserHandler
    },
    '/api/user/sign-out': {
      POST: signOutHandler
    },
    '/api/projects': {
      GET: getUserProjectsHandler
    },
    '/api/projects/sync': {
      POST: syncProjectsWithGithubHandler
    },
    '/api/projects/update-settings': {
      PATCH: updateProjectSettingsHandler
    },
    '/api/pipelines/list': {
      GET: getPipelineListHandler
    },
    '/api/pipelines': {
      GET: getPipelineHandler
    }
  },
  middleware
)

function redirectRoutes(
  routes: Record<string, RouteHandler>,
  middleware?: RouteMiddleware
): Handler {
  return (event, context) => {
    const httpMethod = event.httpMethod as HttpMethod
    const endpoint = event.path.replace(PATH_TO_SERVERLESS_FUNCTIONS, '')

    if (routes[endpoint] && routes[endpoint][httpMethod]) {
      const { handler, access } = getResolvedRouteConfig(
        routes[endpoint][httpMethod]!
      )
      return middleware
        ? middleware(event, context, handler, access)
        : handler(event, context)
    }

    return Promise.resolve({
      statusCode: 404,
      body: JSON.stringify({ message: 'Not found' })
    })
  }
}

async function middleware(
  event: HandlerEvent,
  context: HandlerContext,
  next: Handler,
  access: ApiRouteAccess
): Promise<HandlerResponse> {
  if (access === 'public')
    return next(event, context) as Promise<HandlerResponse>

  // If the route is private
  const accessToken = getCookie(event.headers.cookie, 'accessToken')
  if (!accessToken)
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'No Access Token Found' })
    }

  const userId = await dynamoDb.getAssociatedUserIdWithAccessToken(accessToken)
  if (userId) {
    event.middleware = { userId, githubAccessToken: decrypt(accessToken) }
    return next(event, context) as Promise<HandlerResponse>
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ message: 'You access token has been expired' })
  }
}

function getResolvedRouteConfig(raw: Handler | RouteConfig): RouteConfig {
  return typeof raw === 'function'
    ? {
        handler: raw,
        access: 'private'
      }
    : raw
}