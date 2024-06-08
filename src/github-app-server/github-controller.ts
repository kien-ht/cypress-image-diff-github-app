import { ProbotOctokit } from 'probot'
import fetch from 'node-fetch'
import {
  UpdateBaselines,
  ResolvedReport,
  GetSnapshotsHashed,
  HashedSnapshotToUpdate,
  ProbotLogLevel,
  AddBaselinesToStagedChanges,
  GithubProject
} from '../common/types.js'
import { App as OctokitApp, Octokit } from 'octokit'
import { getReportJsonWithTotalStats, downloadArtifacts } from './helpers.js'
import { GITHUB_APP_NAME } from '../common/constants.js'

export class GithubAppController {
  private app: OctokitApp

  constructor() {
    this.app = new OctokitApp(getProbotConfig())
  }

  async getReports(artifactsUrl?: string): Promise<ResolvedReport> {
    const report = await downloadArtifacts(artifactsUrl)
    return getReportJsonWithTotalStats(report)
  }

  async updateBaselines({ instance, snapshots }: UpdateBaselines) {
    const { installationId, owner, repo, sha, ref } = instance

    const octokit = await this.app.getInstallationOctokit(installationId)

    // create a new tree
    const { data } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: sha,
      tree: snapshots.map((s) => ({
        path: s.baselinePath,
        sha: s.sha,
        mode: '100644',
        type: 'blob'
      }))
    })

    // commit
    const { data: commitData } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `test(${GITHUB_APP_NAME}): update baselines`,
      tree: data.sha,
      parents: [sha]
    })

    // push
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${ref}`,
      sha: commitData.sha
    })
  }

  async addToStagedChanges({
    instance,
    snapshot
  }: AddBaselinesToStagedChanges): Promise<HashedSnapshotToUpdate> {
    const { installationId, owner, repo } = instance
    const octokit = await this.app.getInstallationOctokit(installationId)

    return await getSnapshotsHash({ owner, repo, snapshot }, octokit)
  }
}

export class GithubUserController {
  private octokit: Octokit

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token })
  }

  async getUserProjects(installationId: number): Promise<GithubProject[]> {
    const { data } =
      await this.octokit.rest.apps.listInstallationReposForAuthenticatedUser({
        installation_id: installationId,
        // TODO: Need to do better pagination
        per_page: 100
      })

    return data.repositories.map((r) => ({
      repositoryId: r.id,
      owner: r.owner.login,
      name: r.name,
      fullName: r.full_name,
      url: r.html_url
    }))
  }
}

function getProbotConfig() {
  return {
    appId: process.env.APP_ID!,
    privateKey: process.env.PRIVATE_KEY!,
    secret: process.env.WEBHOOK_SECRET!,
    logLevel: process.env.LOG_LEVEL! as ProbotLogLevel
  }
}

async function getSnapshotsHash(
  { owner, repo, snapshot }: GetSnapshotsHashed,
  octokit: Octokit | ProbotOctokit
): Promise<HashedSnapshotToUpdate> {
  try {
    const content = await toBase64(snapshot.comparisonDataUrl)
    const { data } = await octokit.rest.git.createBlob({
      owner,
      repo,
      content,
      encoding: 'base64'
    })

    return { baselinePath: snapshot.baselinePath, sha: data.sha as string }
  } catch (err) {
    return Promise.reject(err)
  }
}

async function toBase64(url: string): Promise<string> {
  if (!url) return ''

  const response = await fetch(url)
  if (!response.ok) return ''

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer).toString('base64')
}
