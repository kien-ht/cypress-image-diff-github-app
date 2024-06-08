import { Handler } from '@netlify/functions'

import { dynamoDb } from './dynamo-db'
import { generateCookie } from './helpers'
import type { GithubUserInfo } from './types'

export const signInHandler: Handler = async (event) => {
  try {
    const { code } = JSON.parse(event.body ?? '{}')
    const token = await getGithubUserAccessToken(code)
    const githubUser = await getGithubUser(token)

    const foundUserId = await dynamoDb.checkIfUserExistsByGithubId(
      githubUser.id
    )
    if (!foundUserId)
      throw Error('There is no account associated with this Github user')

    const user = await dynamoDb.getUserById(foundUserId)
    const accessToken = await dynamoDb.saveUserAccessToken(token, foundUserId)

    const cookie = generateCookie('accessToken', accessToken)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Set-Cookie': cookie
      },
      body: JSON.stringify(user)
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 400,
      // @ts-expect-error: any
      body: JSON.stringify({ message: err.message ?? err })
    }
  }
}

export const signUpHandler: Handler = async (...[event, , userId]) => {
  console.log(userId)
  try {
    const { code } = JSON.parse(event.body ?? '{}')
    const token = await getGithubUserAccessToken(code)
    const githubUser = await getGithubUser(token)

    const foundUserId = await dynamoDb.checkIfUserExistsByGithubId(
      githubUser.id
    )
    if (foundUserId)
      throw Error(
        'There is already an account associated with this Github user'
      )

    const user = await dynamoDb.createUser(githubUser)
    const accessToken = await dynamoDb.saveUserAccessToken(token, user.uid)

    const cookie = generateCookie('accessToken', accessToken)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Set-Cookie': cookie
      },
      body: JSON.stringify(user)
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 400,
      // @ts-expect-error: any
      body: JSON.stringify({ message: err.message ?? err })
    }
  }
}

async function getGithubUserAccessToken(code: string): Promise<string> {
  const body = new URLSearchParams({
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    code
  })
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    body,
    headers: { Accept: 'application/json' }
  })

  return ((await response.json()) as { access_token: string }).access_token
}

async function getGithubUser(token: string): Promise<GithubUserInfo> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!response.ok) throw Error('Bad Github credentials')

  return (await response.json()) as GithubUserInfo
}
