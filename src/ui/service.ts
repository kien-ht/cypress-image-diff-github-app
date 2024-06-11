import {
  ResolvedReport,
  AddBaselinesToStagedChanges,
  UpdateBaselines,
  HashedSnapshotToUpdate,
  PublicConfig,
  User,
  Project
} from '@commonTypes'
import { PATH_TO_SERVERLESS_FUNCTIONS } from '../common/constants'
import { useMainStore } from '@/store'
import { CustomFetchOptions } from '@/types'

monkeyPatchWindowFetch()

export async function getReports(
  artifactsUrl?: string
): Promise<ResolvedReport> {
  try {
    let url = '/api/reports'

    url += `?${new URLSearchParams(
      Object.entries({ artifactsUrl }).map(([k, v]) => [k, String(v)])
    ).toString()}`

    const response = await window.fetch(url)
    if (!response.ok) throw Error((await response.json()).message)

    return await response.json()
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function getPublicConfig(): Promise<PublicConfig> {
  try {
    const response = await window.fetch('/api/config', undefined, {
      access: 'public'
    })
    if (!response.ok) throw Error((await response.json()).message)

    return await response.json()
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const response = await window.fetch('/api/projects')
    if (!response.ok) throw Error((await response.json()).message)

    return await response.json()
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function syncProjectsWithGithub(): Promise<Project[]> {
  try {
    const response = await window.fetch('/api/projects/sync', {
      method: 'POST'
    })
    if (!response.ok) throw Error((await response.json()).message)

    return await response.json()
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function updateProjectSettings(project: Project): Promise<void> {
  try {
    const response = await window.fetch('/api/projects/update-settings', {
      method: 'PATCH',
      body: JSON.stringify(project)
    })
    if (!response.ok) throw Error((await response.json()).message)
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function signIn(code: string): Promise<void> {
  try {
    const response = await window.fetch(
      '/api/sign-in',
      {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: {
          'Content-Type': 'application/json'
        }
      },
      { access: 'public' }
    )
    if (!response.ok) throw Error((await response.json()).message)
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function signUp(code: string): Promise<void> {
  try {
    const response = await window.fetch(
      '/api/sign-up',
      {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: {
          'Content-Type': 'application/json'
        }
      },
      { access: 'public' }
    )
    if (!response.ok) throw Error((await response.json()).message)
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function getUser(): Promise<User> {
  try {
    const response = await window.fetch('/api/user')
    if (!response.ok) throw Error((await response.json()).message)

    return await response.json()
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function signOut(): Promise<void> {
  try {
    const response = await window.fetch('/api/user/sign-out', {
      method: 'POST'
    })
    if (!response.ok) throw Error((await response.json()).message)
  } catch (err) {
    throw Error((err as Error).message)
  }
}

export async function addToStagedChanges(
  args: AddBaselinesToStagedChanges
): Promise<HashedSnapshotToUpdate> {
  try {
    const response = await window.fetch('/api/reports/staged', {
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
    const response = await window.fetch('/api/reports', {
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
  window.fetch = async function (
    url,
    config,
    { access = 'private' }: CustomFetchOptions = {}
  ) {
    const requestUrl = `${PATH_TO_SERVERLESS_FUNCTIONS}${url}`
    const response = await originalFetch.call(this, requestUrl, config)

    if (access === 'private') {
      const mainStore = useMainStore()
      mainStore.hasSignedIn = response.ok
    }

    return response
  }
}
