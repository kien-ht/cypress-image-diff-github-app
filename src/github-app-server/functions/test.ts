import AWS from 'aws-sdk'
import { Handler } from '@netlify/functions'

AWS.config.update({
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!
  },
  region: process.env.MY_AWS_REGION!
})

const dynamoDb = new AWS.DynamoDB.DocumentClient()

export const handler: Handler = async () => {
  // Request body is passed in as a JSON encoded string in 'event.body'
  // const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.DATABASE_TABLE_NAME!,
    Item: {
      gId: '123', // The id of the author
      content: 'data.content', // Parsed from request body
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
