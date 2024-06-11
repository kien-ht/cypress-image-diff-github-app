import { Handler } from '@netlify/functions'

import { GithubUserController } from '../github-controller'
import { dynamoDb } from '../dynamo-db'

export const getUserProjectsHandler: Handler = async (event) => {
  try {
    const res = await dynamoDb.getUserProjects(event.middleware!.userId)
    return {
      statusCode: 200,
      body: JSON.stringify(res)
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

export const syncProjectsWithGithubHandler: Handler = async (event) => {
  try {
    const controller = new GithubUserController(
      event.middleware!.githubAccessToken
    )
    const githubProjects = await controller.getUserProjects()
    const res = await dynamoDb.createOrSyncProjectsWithGithubRepos(
      githubProjects,
      event.middleware!.userId
    )
    return {
      statusCode: 200,
      body: JSON.stringify(res)
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

export const updateProjectSettingsHandler: Handler = async (event) => {
  try {
    const { projectId, settings } = JSON.parse(event.body!)
    const res = await dynamoDb.updateProjectSettings(projectId, settings)
    return {
      statusCode: 200,
      body: JSON.stringify(res)
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
