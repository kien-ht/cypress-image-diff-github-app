import { Handler } from '@netlify/functions'
import { dynamoDb } from '../dynamo-db'

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
