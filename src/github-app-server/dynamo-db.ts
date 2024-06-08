import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  PutCommand,
  QueryCommand,
  DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

import { User } from '../common/types'
import type { GithubUserInfo } from './types'
import { encrypt } from './helpers'
import { USER_ACCESS_TOKEN_EXPIRATION_TIME } from '../common/constants'

class DynamoDbHelpers {
  public docClient: DynamoDBDocumentClient

  constructor() {
    const client = new DynamoDBClient({
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!
      },
      region: process.env.MY_AWS_REGION!
    })
    this.docClient = DynamoDBDocumentClient.from(client)
  }

  async createUser(user: GithubUserInfo): Promise<User> {
    const { id, login, html_url, avatar_url } = user

    const newUser: User = {
      uid: uuidv4(),
      githubId: id,
      githubName: login,
      githubUrl: html_url,
      githubAvatar: avatar_url,
      createdAt: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: process.env.DB_USERS_TABLE_NAME!,
      Item: newUser
    })

    await this.docClient.send(command)

    return newUser
  }

  async checkIfUserExistsByGithubId(id: number): Promise<string | false> {
    const command = new QueryCommand({
      TableName: process.env.DB_USERS_TABLE_NAME!,
      IndexName: 'githubId-index',
      KeyConditionExpression: 'githubId = :value',
      ExpressionAttributeValues: { ':value': id }
    })
    const data = await this.docClient.send(command)

    return data.Items?.length ? data.Items[0].uid : false
  }

  async saveUserAccessToken(token: string, uid: string): Promise<string> {
    const encryptedToken = encrypt(token)
    const currentTimeSeconds = Math.floor(Date.now() / 1000)

    const command = new PutCommand({
      TableName: process.env.DB_ACCESS_TOKENS_TABLE_NAME!,
      Item: {
        uid,
        token: encryptedToken,
        expiredAt: currentTimeSeconds + USER_ACCESS_TOKEN_EXPIRATION_TIME
      }
    })
    await this.docClient.send(command)

    return encryptedToken
  }

  async getUserIdByAccessToken(token: string): Promise<string | undefined> {
    const command = new QueryCommand({
      TableName: process.env.DB_ACCESS_TOKENS_TABLE_NAME!,
      KeyConditionExpression: '#token = :value',
      ExpressionAttributeNames: { '#token': 'token' },
      ExpressionAttributeValues: { ':value': token }
    })
    const data = await this.docClient.send(command)

    return data.Items?.length ? data.Items[0].uid : undefined
  }

  async getUserById(uid: string): Promise<User | undefined> {
    const command = new QueryCommand({
      TableName: process.env.DB_USERS_TABLE_NAME!,
      KeyConditionExpression: 'uid = :value',
      ExpressionAttributeValues: { ':value': uid }
    })
    const data = await this.docClient.send(command)

    return data.Items ? (data.Items[0] as User) : undefined
  }
}

export const dynamoDb = new DynamoDbHelpers()
