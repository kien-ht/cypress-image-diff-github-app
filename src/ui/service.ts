import {
  ResolvedReport,
  AddBaselinesToStagedChanges,
  UpdateBaselines,
  HashedSnapshotToUpdate,
  PublicConfig
} from '@commonTypes'
import { PATH_TO_SERVERLESS_FUNCTIONS } from '../common/constants'

monkeyPatchWindowFetch()

export async function getReports(
  artifactsUrl?: string
): Promise<ResolvedReport> {
  try {
    let url = '/api/reports'

    url += `?${new URLSearchParams(
      Object.entries({ artifactsUrl }).map(([k, v]) => [k, String(v)])
    ).toString()}`

    const response = await fetch(url)
    if (!response.ok) throw Error((await response.json()).message)

    return await response.json()
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function getPublicConfig(): Promise<PublicConfig> {
  try {
    const response = await fetch('/api/config')
    if (!response.ok) throw Error((await response.json()).message)

    return await response.json()
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function establishUserAccess(code: string): Promise<void> {
  try {
    const response = await fetch(`/api/auth?code=${code}`)
    if (!response.ok) throw Error((await response.json()).message)
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function addToStagedChanges(
  args: AddBaselinesToStagedChanges
): Promise<HashedSnapshotToUpdate> {
  try {
    const response = await fetch('/api/reports/staged', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    })
    if (!response.ok) throw Error((await response.json()).message)
    return await response.json()
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function updateBaselines(args: UpdateBaselines): Promise<void> {
  try {
    const response = await fetch('/api/reports', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args)
    })
    if (!response.ok) throw Error((await response.json()).message)
  } catch (err) {
    throw Error((err as Error).message)
  }
}

function monkeyPatchWindowFetch() {
  const originalFetch = window.fetch
  window.fetch = function (url, config) {
    const requestUrl = `${PATH_TO_SERVERLESS_FUNCTIONS}${url}`
    return originalFetch.call(this, requestUrl, config)
  }
}
