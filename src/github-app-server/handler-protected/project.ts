import { Handler } from '@netlify/functions'

import { GithubUserController } from '../github-controller'

export const getProjectsHandler: Handler = async (event) => {
  try {
    const controller = new GithubUserController(
      event.middleware!.githubAccessToken
    )
    const json = await controller.getUserProjects(
      Number(event.queryStringParameters!.installationId)
    )
    return {
      statusCode: 200,
      body: JSON.stringify(json)
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
