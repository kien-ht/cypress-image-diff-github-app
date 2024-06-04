import { v4 as uuidv4 } from 'uuid'
import { Handler } from '@netlify/functions'
import { getDynamoDb } from '../dynamo-db'

const dynamoDb = getDynamoDb()

export const handler: Handler = async () => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  // const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.DB_USERS_TABLE_NAME!,
    Item: {
      uid: uuidv4(),
      oaId: '71423573',
      oaAvatarUrl: 'https://avatars.githubusercontent.com/u/71423573?v=4',
      oaName: 'kien-ht',
      createdAt: new Date().toISOString()
    }
  }

  try {
    await dynamoDb.put(params).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (err as Error).message })
    }
  }
}
