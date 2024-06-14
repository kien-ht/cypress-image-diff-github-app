import { Probot } from 'probot'
import { downloadArtifacts } from './helpers.js'
import {
  GITHUB_APP_NAME,
  CIRCLE_CI_CONTEXT_NAME,
  CIRCLE_CI_PROJECT_TOKEN_KEY
} from '../common/constants.js'
import { GithubCommitState } from '../common/types.js'
import { getArtifactsUrl } from './helpers.js'
import { dynamoDb } from './dynamo-db.js'

export const appFn = (app: Probot) => {
  app.on('status', async (context): Promise<void> => {
    if (context.payload.context !== CIRCLE_CI_CONTEXT_NAME) return

    const installationId = context.payload.installation!.id
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const repoId = context.payload.repository.id
    const sha = context.payload.sha

    if (context.payload.state === 'pending') {
      // Create a new commit status
      const projectId =
        await dynamoDb.getAssociatedProjectIdWithRepositoryId(repoId)
      if (!projectId) return

      const project = await dynamoDb.getProjectByProjectId(projectId)
      const hasCircleCiToken = project?.settings.envs.find(
        (e) => e.key === CIRCLE_CI_PROJECT_TOKEN_KEY
      )
      if (!hasCircleCiToken) return

      try {
        const { data: pullRequests } = await context.octokit.rest.pulls.list({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name
        })

        const pullRequest = pullRequests.find((p) => p.head.sha === sha)!

        const { pipelineId } = await dynamoDb.createPipeline({
          installationId,
          owner,
          sha,
          pullNumber: pullRequest.number,
          targetBranch: pullRequest.base.ref,
          commitMessage: pullRequest.title,
          author: pullRequest.head.user?.login,
          authorAvatar: pullRequest.head.user?.avatar_url,
          repo,
          repositoryId: repoId,
          branch: pullRequest.head.ref,
          status: 'pending'
        })

        await context.octokit.rest.repos.createCommitStatus({
          owner,
          repo,
          sha,
          state: 'pending',
          description: 'Visual Regression Test',
          context: GITHUB_APP_NAME,
          target_url: `${process.env.GITHUB_APP_DOMAIN}/pipelines/${pipelineId}`
        })
      } catch (err) {
        console.log(err)
      }
    } else {
      // Update commit status
      let description: string
      let state: GithubCommitState
      let artifactsUrl = ''
      let total = 0
      let totalFailed = 0
      let totalPassed = 0

      try {
        const projectId =
          await dynamoDb.getAssociatedProjectIdWithRepositoryId(repoId)
        const project = await dynamoDb.getProjectByProjectId(projectId!)
        const circleCiToken = project!.settings.envs.find(
          (e) => e.key === CIRCLE_CI_PROJECT_TOKEN_KEY
        )!.value

        artifactsUrl = await getArtifactsUrl(
          context.payload.target_url ?? '',
          circleCiToken
        )
        const report = await downloadArtifacts(artifactsUrl, circleCiToken)

        total = report.total
        totalFailed = report.totalFailed
        totalPassed = report.totalPassed

        if (totalFailed === 0) {
          state = 'success'
          description = 'All tests passed!'
        } else {
          state = 'failure'
          description =
            totalFailed === 1
              ? `A visual change needs review`
              : `${totalFailed} visual changes need review`
        }
      } catch (err) {
        state = 'error'
        description = typeof err === 'string' ? err : 'Something went wrong...'
        console.log(err)
      }

      try {
        const { pipelineId } = await dynamoDb.updatePipeline({
          sha,
          status: state,
          total,
          totalFailed,
          totalPassed,
          artifactsUrl
        })

        await context.octokit.rest.repos.createCommitStatus({
          owner,
          repo,
          sha,
          state,
          description,
          context: GITHUB_APP_NAME,
          target_url: `${process.env.GITHUB_APP_DOMAIN}/pipelines/${pipelineId}`
        })
      } catch (err) {
        console.log(err)
      }
    }
  })
}
