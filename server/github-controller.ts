import { ProbotOctokit } from 'probot'
import fetch from 'node-fetch'
import {
  UpdateBaselines,
  GetSnapshotsHashed,
  HashedSnapshotToUpdate,
  ProbotLogLevel,
  AddBaselinesToStagedChanges,
  GithubProject
} from '../common/types.js'
import { App as OctokitApp, Octokit } from 'octokit'
import { GITHUB_APP_NAME } from '../common/constants.js'

export class GithubAppController {
  private app: OctokitApp

  constructor() {
    this.app = new OctokitApp(getProbotConfig())
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

  async getUserProjects(): Promise<GithubProject[]> {
    const { data: installationData } =
      await this.octokit.rest.apps.listInstallationsForAuthenticatedUser({
        // TODO: if there are more than 100 installations associated with this single user, it will be a problem
        per_page: 100
      })

    const foundInstallations = installationData.installations.filter(
      (i) => i.app_id === Number(process.env.APP_ID)
    )

    if (!foundInstallations.length) throw Error('Not found any installation')

    const repos = await Promise.all(
      foundInstallations.map(async (installation) => {
        const { data: repoData } =
          await this.octokit.rest.apps.listInstallationReposForAuthenticatedUser(
            {
              installation_id: installation.id,
              // TODO: if there are more than 100 repos associated with this single installation, it will be a problem
              // Maybe limited to 100 repos per installation?
              per_page: 100
            }
          )
        return repoData.repositories.map((r) => ({
          repositoryId: r.id,
          owner: r.owner.login,
          name: r.name,
          fullName: r.full_name,
          url: r.html_url
        }))
      })
    )

    return repos.flat()
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
