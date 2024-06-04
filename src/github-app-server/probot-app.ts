import { Probot } from 'probot'
import { downloadArtifacts } from './github-controller.js'
import { GITHUB_APP_NAME, CIRCLE_CI_CONTEXT_NAME } from '../common/constants.js'
import { DetailsUrlQuery, GithubCommitState } from '../common/types.js'
import { getArtifactsUrl } from './helpers.js'

export const appFn = (app: Probot) => {
  app.on('status', async (context): Promise<void> => {
    if (context.payload.context !== CIRCLE_CI_CONTEXT_NAME) return

    const installationId = context.payload.installation!.id
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const sha = context.payload.sha

    if (context.payload.state === 'pending') {
      // Create a new commit status
      try {
        await context.octokit.rest.repos.createCommitStatus({
          owner,
          repo,
          sha,
          state: 'pending',
          description: 'Visual Regression Test',
          context: GITHUB_APP_NAME
        })
      } catch (err) {
        console.log(err)
      }
    } else {
      // Update commit status
      let description: string
      let state: GithubCommitState
      let artifactsUrl = ''

      try {
        artifactsUrl = await getArtifactsUrl(context.payload.target_url ?? '')
        const { totalFailed } = await downloadArtifacts(artifactsUrl)

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
        const { data: pullRequests } = await context.octokit.rest.pulls.list({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name
        })

        const pullRequest = pullRequests.find((p) => p.head.sha === sha)!
        const rawQuery: DetailsUrlQuery = {
          installationId,
          owner,
          repo,
          sha,
          ref: pullRequest.head.ref,
          pullNumber: pullRequest.number,
          targetRef: pullRequest.base.ref,
          author: pullRequest.head.user?.login,
          authorAvatar: pullRequest.head.user?.avatar_url,
          artifactsUrl
        }
        const queryString = new URLSearchParams(
          Object.entries(rawQuery).map(([k, v]) => [k, String(v)])
        ).toString()

        await context.octokit.rest.repos.createCommitStatus({
          owner,
          repo,
          sha,
          state,
          description,
          context: GITHUB_APP_NAME,
          target_url: `${process.env.GITHUB_APP_DOMAIN}/details?${queryString}`
        })
      } catch (err) {
        console.log(err)
      }
    }
  })
}
