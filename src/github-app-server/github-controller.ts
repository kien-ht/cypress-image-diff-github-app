import { ProbotOctokit } from 'probot'
import fetch from 'node-fetch'
import {
  UpdateBaselines,
  ResolvedReport,
  Report,
  GetSnapshotsHashed,
  HashedSnapshotToUpdate,
  ProbotLogLevel,
  AddBaselinesToStagedChanges,
  PublicConfig
} from '../common/types.js'
import { App as OctokitApp, Octokit } from 'octokit'
import { getReportJsonWithTotalStats } from './helpers.js'
import { GITHUB_APP_NAME } from '../common/constants.js'

export class GithubController {
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

  getPublicConfig(): PublicConfig {
    return { clientId: process.env.CLIENT_ID! }
  }
}

export async function downloadArtifacts(url?: string): Promise<Report> {
  if (!url) throw Error('No artifacts url found')

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Circle-Token':
        'CCIPAT_7NPK5NbZX7s7SbnUjm7rsM_faf5d5c3bc1924ac33926837cbe36c9c683fc287'
    }
  })
  if (!response.ok) throw Error(`Can't download this artifacts url: ${url}`)

  const data = (await response.json()) as { items: Record<string, string>[] }

  if (data.items.length === 0) return Promise.reject('Not found artifacts')
  console.log(data.items)
  const reportItem = data.items.find((i) => /\.json$/.test(i.path))

  if (!reportItem) return Promise.reject('Not found report')

  const report = (await (await fetch(reportItem.url)).json()) as Report
  const urlMap = data.items.reduce(
    (map, item) => {
      map[item.path] = item.url
      return map
    },
    {} as Record<string, string>
  )
  return {
    ...report,
    suites: report.suites.map((s) => ({
      ...s,
      tests: s.tests.map((t) => ({
        ...t,
        baselineDataUrl: urlMap[t.baselinePath],
        diffDataUrl: urlMap[t.diffPath],
        comparisonDataUrl: urlMap[t.comparisonPath]
      }))
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
