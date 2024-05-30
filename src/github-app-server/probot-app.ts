import { Probot } from 'probot'
import { downloadArtifacts } from './controller.js'
import { GITHUB_APP_NAME, CIRCLE_CI_CONTEXT_NAME } from '../common/constants.js'
import { DetailsUrlQuery, GithubCommitState } from '../common/types.js'

interface JobItem {
  dependencies: unknown
  job_number: number
  id: string
  started_at: string
  name: string
  project_slug: string
  status: string
  type: string
  stopped_at: string
}

export const appFn = (app: Probot) => {
  // Create a new commit status
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

async function getArtifactsUrl(targetUrl: string): Promise<string> {
  // targetUrl example: https://app.circleci.com/pipelines/circleci/UhkTUvo4ZbS7cgD3wDqaei/GbDbvf1J4wtqsiRrp5B19N/31/workflows/3817fa0d-8311-4334-a226-68fa14f83b56
  const workflowId = targetUrl.split('/').pop()

  const response = await fetch(
    `https://circleci.com/api/v2/workflow/${workflowId}/job`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Circle-Token':
          'CCIPAT_7NPK5NbZX7s7SbnUjm7rsM_faf5d5c3bc1924ac33926837cbe36c9c683fc287'
      }
    }
  )
  if (!response.ok)
    throw Error(`There was a problem while fetching workflow id: ${workflowId}`)

  const data = (await response.json()) as { items: JobItem[] }
  // There should be only one job inside this workflow
  const { project_slug, job_number } = data.items[0]

  return `https://circleci.com/api/v2/project/${project_slug}/${job_number}/artifacts`
}
