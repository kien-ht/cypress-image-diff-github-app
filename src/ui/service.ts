import {
  ResolvedReport,
  AddBaselinesToStagedChanges,
  UpdateBaselines,
  HashedSnapshotToUpdate
} from '@commonTypes'
import { PATH_TO_SERVERLESS_FUNCTIONS } from '../common/constants'

export { getReports, addToStagedChanges, updateBaselines }

monkeyPatchWindowFetch()

async function getReports(artifactsUrl?: string): Promise<ResolvedReport> {
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

async function addToStagedChanges(
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

async function updateBaselines(args: UpdateBaselines): Promise<void> {
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
