import { config, DynamoDB } from 'aws-sdk'

export function getDynamoDb() {
  config.update({
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!
    },
    region: process.env.MY_AWS_REGION!
  })

  return new DynamoDB.DocumentClient()
}
