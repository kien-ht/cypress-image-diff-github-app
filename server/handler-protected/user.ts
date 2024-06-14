import { Handler } from '@netlify/functions'
import { dynamoDb } from '../dynamo-db'
import { generateCookie } from '../helpers'

export const getUserHandler: Handler = async (event) => {
  try {
    const user = await dynamoDb.getUserById(event.middleware!.userId)
    return {
      statusCode: 200,
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

export const signOutHandler: Handler = async () => {
  try {
    const cookie = generateCookie('accessToken', '', { maxAge: 0 })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Set-Cookie': cookie
      }
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
