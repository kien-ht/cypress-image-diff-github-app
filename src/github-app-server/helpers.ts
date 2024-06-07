import crypto from 'crypto'
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

// curl https://circleci.com/api/v1.1/project/:vcs-type/:username/:project/:build_num/artifacts -H "Circle-Token: <circle-token>"

// curl "https://circleci.com/api/v1.1/project/circleci/UhkTUvo4ZbS7cgD3wDqaei/GbDbvf1J4wtqsiRrp5B19N?limit=5&filter=completed" -H "Circle-Token: $CIRCLE_CI_TOKEN"
// https://app.circleci.com/pipelines/circleci/UhkTUvo4ZbS7cgD3wDqaei/GbDbvf1J4wtqsiRrp5B19N/31/workflows/3817fa0d-8311-4334-a226-68fa14f83b56
