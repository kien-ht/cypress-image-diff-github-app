import { Handler } from '@netlify/functions'
import {
  AddBaselinesToStagedChanges,
  UpdateBaselines
} from '../../common/types'
import { GithubAppController } from '../github-controller'

export const updateReportsHandler: Handler = async (event) => {
  try {
    const controller = new GithubAppController()
    await controller.updateBaselines(
      JSON.parse(event.body ?? '{}') as unknown as UpdateBaselines
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
    const controller = new GithubAppController()
    const stagedChange = await controller.addToStagedChanges(
      JSON.parse(event.body ?? '{}') as unknown as AddBaselinesToStagedChanges
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
