import {
  ResolvedReport,
  AddBaselinesToStagedChanges,
  UpdateBaselines,
  HashedSnapshotToUpdate,
  PublicConfig,
  User
} from '@commonTypes'
import { PATH_TO_SERVERLESS_FUNCTIONS } from '../common/constants'
import { useMainStore } from '@/store'

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

export async function signIn(code: string): Promise<void> {
  try {
    const response = await fetch('/api/sign-in', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw Error((await response.json()).message)
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function signUp(code: string): Promise<void> {
  try {
    const response = await fetch('/api/sign-up', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw Error((await response.json()).message)
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function getUser(): Promise<User> {
  try {
    const response = await fetch('/api/user')
    if (!response.ok) throw Error((await response.json()).message)

    return await response.json()
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
  window.fetch = async function (url, config) {
    const requestUrl = `${PATH_TO_SERVERLESS_FUNCTIONS}${url}`
    const response = await originalFetch.call(this, requestUrl, config)
    const mainStore = useMainStore()
    mainStore.hasSignedIn = response.ok
    return response
  }
}
