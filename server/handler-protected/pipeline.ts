import { Handler } from '@netlify/functions'

import { dynamoDb } from '../dynamo-db'
import { PipelineFilter } from '../../common/types'
import { downloadArtifacts, getReportJsonWithTotalStats } from '../helpers'
import { CIRCLE_CI_PROJECT_TOKEN_KEY } from '../../common/constants'

export const getPipelineListHandler: Handler = async (event) => {
  try {
    const res = await dynamoDb.getPipelines(
      event.queryStringParameters as PipelineFilter
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

export const getPipelineHandler: Handler = async (event) => {
  try {
    const res = await dynamoDb.getPipelineByPipelineId(
      event.queryStringParameters!.pipelineId!
    )
    const project = await dynamoDb.getProjectByProjectId(res!.projectId)
    const report = await downloadArtifacts(
      res!.artifactsUrl!,
      project!.settings.envs.find((e) => e.key === CIRCLE_CI_PROJECT_TOKEN_KEY)!
        .value
    )
    return {
      statusCode: 200,
      body: JSON.stringify({
        ...res,
        report: getReportJsonWithTotalStats(report)
      })
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
