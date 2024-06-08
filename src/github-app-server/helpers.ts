import crypto from 'crypto'
import { type CookieSerializeOptions, parse, serialize } from 'cookie'
import { Report, ResolvedReport } from '../common/types.js'

export function getReportJsonWithTotalStats(json: Report): ResolvedReport {
  return {
    ...json,
    suites: json.suites
      .map((suite) => ({
        ...suite,
        tests: suite.tests.map((test) => ({
          ...test,
          passed: test.status === 'pass' ? 1 : 0,
          failed: test.status === 'fail' ? 1 : 0
        }))
      }))
      .map((suite) => ({
        ...suite,
        id: suite.path,
        passed: suite.tests.reduce((s, i) => s + i.passed, 0),
        failed: suite.tests.reduce((s, i) => s + i.failed, 0)
      }))
  }
}

export async function getArtifactsUrl(targetUrl: string): Promise<string> {
  // targetUrl example: https://app.circleci.com/pipelines/circleci/UhkTUvo4ZbS7cgD3wDqaei/GbDbvf1J4wtqsiRrp5B19N/31/workflows/3817fa0d-8311-4334-a226-68fa14f83b56
  const [vcsType, userName, project, , , workflowId] = targetUrl
    .replace('https://app.circleci.com/pipelines/', '')
    .split('/')

  const response = await fetch(
    `https://circleci.com/api/v1.1/project/${vcsType}/${userName}/${project}?limit=5&filter=completed`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Circle-Token':
          'CCIPRJ_3JfGq9Y94DympumSqQbBke_854042d0b855db02414e08fcf557dd22e9689a2d'
      }
    }
  )
  if (!response.ok) throw Error('There was a problem while fetching CI jobs')

  const data = (await response.json()) as {
    workflows: Record<string, string>
    build_num: number
  }[]
  const foundJob = data.find((d) => d.workflows.workflow_id === workflowId)!

  return `https://circleci.com/api/v1.1/project/${vcsType}/${userName}/${project}/${foundJob.build_num}/artifacts`
}

// This getArtifactsUrl function below is for CircleCI API v2
// It is recommended to use v2, however, at the time of development, project token is not available in v2, until then, we use getArtifactsUrl() above
// export async function getArtifactsUrl(targetUrl: string): Promise<string> {
//   // targetUrl example: https://app.circleci.com/pipelines/circleci/UhkTUvo4ZbS7cgD3wDqaei/GbDbvf1J4wtqsiRrp5B19N/31/workflows/3817fa0d-8311-4334-a226-68fa14f83b56
//   const workflowId = targetUrl.split('/').pop()

//   const response = await fetch(
//     `https://circleci.com/api/v2/workflow/${workflowId}/job`,
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//         'Circle-Token':
//           'CCIPAT_7NPK5NbZX7s7SbnUjm7rsM_faf5d5c3bc1924ac33926837cbe36c9c683fc287'
//       }
//     }
//   )
//   if (!response.ok)
//     throw Error(`There was a problem while fetching workflow id: ${workflowId}`)

//   const data = (await response.json()) as { items: Record<string, string>[] }
//   // There should be only one job inside this workflow
//   const { project_slug, job_number } = data.items[0]

//   return `https://circleci.com/api/v2/project/${project_slug}/${job_number}/artifacts`
// }

export function encrypt(text: string) {
  const algorithm = 'aes-256-ctr'
  const secretKey = Buffer.from(process.env.ENCRYPTION_SECRET_KEY!, 'base64')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  return `${iv.toString('base64')}:${encrypted.toString('base64')}`
}

export function decrypt(hash: string) {
  const algorithm = 'aes-256-ctr'
  const secretKey = Buffer.from(process.env.ENCRYPTION_SECRET_KEY!, 'base64')
  const [base64Iv, base64EncryptedText] = hash.split(':')
  const iv = Buffer.from(base64Iv, 'base64')
  const encryptedText = Buffer.from(base64EncryptedText, 'base64')
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv)
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final()
  ])
  return decrypted.toString()
}

export function generateCookie(
  name: string,
  value: string,
  options: CookieSerializeOptions = {}
): string {
  const defaultOptions = {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: true
  }
  const cookie = serialize(name, value, { ...defaultOptions, ...options })
  return cookie
}

export function getCookie(
  cookies: string = '',
  name: string
): string | undefined {
  const cookie = parse(cookies)[name]
  return cookie
}

export function setupEnvVariables() {
  // Replace escaped newlines to fix this octokit bug
  // Error: secretOrPrivateKey must be an asymmetric key when using RS256
  // See more here https://github.com/octokit/auth-app.js/issues/465
  process.env.PRIVATE_KEY = process.env.PRIVATE_KEY!.replace(/\\n/g, '\n')
}

export async function downloadArtifacts(url?: string): Promise<Report> {
  if (!url) throw Error('No artifacts url found')

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Circle-Token':
        'CCIPRJ_3JfGq9Y94DympumSqQbBke_854042d0b855db02414e08fcf557dd22e9689a2d'
    }
  })
  if (!response.ok) throw Error(`Can't download this artifacts url: ${url}`)
  console.log(url, '==url')

  // This is for CircleCI v2 schema response
  // const data = (await response.json()) as { items: Record<string, string>[] }
  // const artifacts = data.items
  const artifacts = (await response.json()) as Record<string, string>[]

  if (artifacts.length === 0) return Promise.reject('Not found artifacts')
  const reportItem = artifacts.find((i) => /\.json$/.test(i.path))

  if (!reportItem) return Promise.reject('Not found report')

  const report = (await (await fetch(reportItem.url)).json()) as Report
  const urlMap = artifacts.reduce(
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
