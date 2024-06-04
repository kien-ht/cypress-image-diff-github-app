import { Handler } from '@netlify/functions'
import { getDynamoDb } from '../dynamo-db'

const dynamoDb = getDynamoDb()

export const handler: Handler = async (event) => {
  const { oaAccessToken } = event.queryStringParameters ?? {}

  if (!oaAccessToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'oaAccessToken is required' })
    }
  }

  const params = {
    TableName: process.env.DB_USERS_TABLE_NAME!,
    IndexName: 'oaAccessToken-index',
    KeyConditionExpression: 'oaAccessToken = :oaAccessToken',
    ExpressionAttributeValues: {
      ':oaAccessToken': oaAccessToken
    }
  }

  try {
    const data = await dynamoDb.query(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (err as Error).message })
    }
  }
}
