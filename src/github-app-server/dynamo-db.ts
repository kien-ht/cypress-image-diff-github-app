import AWS from 'aws-sdk'

export function getDynamoDb() {
  AWS.config.update({
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!
    },
    region: process.env.MY_AWS_REGION!
  })

  return new AWS.DynamoDB.DocumentClient()
}
