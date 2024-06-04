import { Handler } from '@netlify/functions'
import { encrypt } from './helpers'

export const establishUserAccessTokenHandler: Handler = async (event) => {
  try {
    const token = await getUserAccessToken(event.queryStringParameters!.code!)

    const hash = encrypt(token)

    // look for this user if exist, otherwise create new

    // create new user
    return {
      statusCode: 200,
      body: JSON.stringify(hash)
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

async function getUserAccessToken(code: string): Promise<string> {
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
