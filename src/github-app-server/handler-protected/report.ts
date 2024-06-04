import { Handler } from '@netlify/functions'
import {
  AddBaselinesToStagedChanges,
  UpdateBaselines
} from '../../common/types'
import { GithubController } from '../github-controller'

export const getReportsHandler: Handler = async (event) => {
  try {
    const controller = new GithubController()
    const json = await controller.getReports(
      event.queryStringParameters?.artifactsUrl
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

export const updateReportsHandler: Handler = async (event) => {
  try {
    const controller = new GithubController()
    await controller.updateBaselines(
      JSON.parse(event.body!) as unknown as UpdateBaselines
    )
    return {
      statusCode: 200
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

export const addToStagedChangesHandler: Handler = async (event) => {
  try {
    const controller = new GithubController()
    const stagedChange = await controller.addToStagedChanges(
      JSON.parse(event.body!) as unknown as AddBaselinesToStagedChanges
    )
    return {
      statusCode: 200,
      body: JSON.stringify(stagedChange)
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
