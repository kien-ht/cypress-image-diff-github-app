import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  PutCommand,
  QueryCommand,
  DynamoDBDocumentClient,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import mergeWith from 'lodash/mergeWith'
import isArray from 'lodash/isArray'

import {
  GithubProject,
  RawPipeline,
  CreatedPipeline,
  PipelineCompositeKey,
  PipelineFilter,
  Project,
  ProjectSetting,
  User
} from '../common/types'
import type { GithubUserInfo } from './types'
import {
  encrypt,
  getDefaultProjectSettings,
  maskProjectSecrets,
  maskSecret
} from './helpers'
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

  async getAssociatedUserIdWithGithubId(
    id: number,
    throwError = true
  ): Promise<string | undefined> {
    const command = new QueryCommand({
      TableName: process.env.DB_USERS_TABLE_NAME!,
      IndexName: 'githubId-index',
      KeyConditionExpression: 'githubId = :value',
      ExpressionAttributeValues: { ':value': id }
    })
    const data = await this.docClient.send(command)

    if (data.Items?.[0]) return data.Items[0].uid

    if (throwError) {
      throw Error(`No associated uid found with githubId = ${id}`)
    }
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

  async getAssociatedUserIdWithAccessToken(
    token: string
  ): Promise<string | never> {
    const command = new QueryCommand({
      TableName: process.env.DB_ACCESS_TOKENS_TABLE_NAME!,
      KeyConditionExpression: '#token = :value',
      ExpressionAttributeNames: { '#token': 'token' },
      ExpressionAttributeValues: { ':value': token }
    })
    const data = await this.docClient.send(command)

    if (data.Items?.[0]) return data.Items[0].uid

    throw Error(
      `No associated uid found with accessToken = ${maskSecret(token)}`
    )
  }

  async getUserById(uid: string): Promise<User | never> {
    const command = new QueryCommand({
      TableName: process.env.DB_USERS_TABLE_NAME!,
      KeyConditionExpression: 'uid = :value',
      ExpressionAttributeValues: { ':value': uid }
    })
    const data = await this.docClient.send(command)

    if (data.Items?.[0]) return data.Items[0] as User

    throw Error(`No user found with uid = ${uid}`)
  }

  async getAssociatedProjectIdWithRepositoryId(
    repositoryId: number,
    throwError = true
  ): Promise<string | undefined> {
    const queryCommand = new QueryCommand({
      TableName: process.env.DB_PROJECTS_TABLE_NAME!,
      IndexName: 'repositoryId-index',
      KeyConditionExpression: 'repositoryId = :value',
      ExpressionAttributeValues: { ':value': repositoryId }
    })
    const data = await this.docClient.send(queryCommand)

    if (data.Items?.[0]) return data.Items[0].projectId

    if (throwError) {
      throw Error(
        `No associated projectId found with repositoryId = ${repositoryId}`
      )
    }
  }

  async getProjectByProjectId(projectId: string): Promise<Project | undefined> {
    const command = new QueryCommand({
      TableName: process.env.DB_PROJECTS_TABLE_NAME!,
      KeyConditionExpression: 'projectId = :value',
      ExpressionAttributeValues: { ':value': projectId }
    })
    const data = await this.docClient.send(command)

    if (data.Items?.[0]) return data.Items[0] as Project

    return undefined
  }

  async createOrSyncProjectsWithGithubRepos(
    githubProjects: GithubProject[],
    uid: string
  ): Promise<Project[]> {
    const projects = await Promise.all(
      githubProjects.map(async (p) => {
        let project: Project

        const associatedProjectId =
          await this.getAssociatedProjectIdWithRepositoryId(
            p.repositoryId,
            false
          )
        if (associatedProjectId) {
          const command = new UpdateCommand({
            TableName: process.env.DB_PROJECTS_TABLE_NAME!,
            Key: { projectId: associatedProjectId },
            UpdateExpression:
              'set #owner = :ownerValue, #name = :nameValue, #fullName = :fullNameValue, #url = :urlValue',
            ExpressionAttributeNames: {
              '#owner': 'owner',
              '#name': 'name',
              '#fullName': 'fullName',
              '#url': 'url'
            },
            ExpressionAttributeValues: {
              ':ownerValue': p.owner,
              ':nameValue': p.name,
              ':fullNameValue': p.fullName,
              ':urlValue': p.url
            },
            ReturnValues: 'ALL_NEW'
          })
          const data = await this.docClient.send(command)
          project = maskProjectSecrets(data.Attributes! as Project)
        } else {
          project = {
            ...p,
            projectId: uuidv4(),
            settings: getDefaultProjectSettings()
          }
          const command = new PutCommand({
            TableName: process.env.DB_PROJECTS_TABLE_NAME!,
            Item: project
          })
          await this.docClient.send(command)
        }

        // update user and project relations table
        try {
          await this.docClient.send(
            new PutCommand({
              TableName: process.env.DB_USER_PROJECT_RELATIONS_TABLE_NAME!,
              Item: {
                uid,
                projectId: project.projectId
              }
            })
          )
        } catch {
          // just skip if uid and projectId relation already exist in the database
        }
        return project
      })
    )

    return projects
  }

  async getAssociatedProjectIdsWithUserId(uid: string): Promise<string[]> {
    const command = new QueryCommand({
      TableName: process.env.DB_USER_PROJECT_RELATIONS_TABLE_NAME!,
      KeyConditionExpression: 'uid = :value',
      ExpressionAttributeValues: { ':value': uid }
    })
    const data = await this.docClient.send(command)

    if (data.Items) return data.Items.map((d) => d.projectId) as string[]

    return []
  }

  async getUserProjects(uid: string): Promise<Project[]> {
    const projectIds = await this.getAssociatedProjectIdsWithUserId(uid)
    const projects = await Promise.all(
      projectIds.map(async (id) => {
        const project = await this.getProjectByProjectId(id)
        return project && maskProjectSecrets(project)
      })
    )
    return projects.filter((p) => p) as Project[]
  }

  async updateProjectSettings(
    projectId: string,
    settings: ProjectSetting
  ): Promise<Project> {
    const project = await this.getProjectByProjectId(projectId)
    if (!project)
      throw Error(`No associated project found with projectId = ${projectId}`)

    const newSettings: ProjectSetting = mergeWith(
      settings,
      {
        envs: settings.envs.map((e) =>
          e.createdAt
            ? project.settings.envs.find((env) => env.key === e.key)!
            : { ...e, createdAt: new Date().toISOString() }
        )
      },
      (a, b) => (isArray(b) ? b : undefined)
    )
    const command = new UpdateCommand({
      TableName: process.env.DB_PROJECTS_TABLE_NAME!,
      Key: { projectId },
      UpdateExpression: 'set #settings = :settingValues',
      ExpressionAttributeNames: {
        '#settings': 'settings'
      },
      ExpressionAttributeValues: {
        ':settingValues': newSettings
      },
      ReturnValues: 'ALL_NEW'
    })
    const data = await this.docClient.send(command)
    return maskProjectSecrets(data.Attributes! as Project)
  }

  async getPipelines(filters: PipelineFilter): Promise<CreatedPipeline[]> {
    return this.getPipelinesByProjectId(filters.projectId!)
  }

  async getPipelinesByProjectId(projectId: string): Promise<CreatedPipeline[]> {
    const command = new QueryCommand({
      TableName: process.env.DB_PIPELINES_TABLE_NAME!,
      IndexName: 'projectId-createdAt-index',
      KeyConditionExpression: 'projectId = :value',
      ExpressionAttributeValues: { ':value': projectId }
    })
    const data = await this.docClient.send(command)

    if (data.Items) return data.Items as CreatedPipeline[]

    return []
  }

  // async getPipelinesByProjectIdAndBranch(filters: PipelineFilter): Promise<CreatedPipeline[]> {
  //   const command = new QueryCommand({
  //     TableName: process.env.DB_PIPELINES_TABLE_NAME!,
  //     IndexName: 'projectId-branch-createdAt-index',
  //     KeyConditionExpression: 'projectId = :value AND createdAt = :createdAtValue',
  //     ExpressionAttributeValues: { ':value': filters.projectId, ':createdAtValue': filters.branch }
  //   })
  //   const data = await this.docClient.send(command)

  //   if (data.Items) return data.Items as CreatedPipeline[]

  //   return []
  // }

  async createPipeline(pipeline: RawPipeline): Promise<CreatedPipeline> {
    const projectId = await this.getAssociatedProjectIdWithRepositoryId(
      pipeline.repositoryId
    )
    const newPipeline: CreatedPipeline = {
      ...pipeline,
      pipelineId: uuidv4(),
      projectId: projectId!,
      createdAt: Date.now()
    }

    const command = new PutCommand({
      TableName: process.env.DB_PIPELINES_TABLE_NAME!,
      Item: newPipeline
    })

    await this.docClient.send(command)

    return newPipeline
  }

  async getPipelineCompositeKeyByCommitSha(
    sha: string,
    throwError = true
  ): Promise<PipelineCompositeKey | undefined> {
    const command = new QueryCommand({
      TableName: process.env.DB_PIPELINES_TABLE_NAME!,
      IndexName: 'sha-index',
      KeyConditionExpression: 'sha = :value',
      ExpressionAttributeValues: { ':value': sha }
    })
    const data = await this.docClient.send(command)

    if (data.Items?.[0])
      return {
        pipelineId: data.Items[0].pipelineId,
        createdAt: data.Items[0].createdAt
      }

    if (throwError) {
      throw Error(
        `No associated pipeline composite key found with sha = ${sha}`
      )
    }
  }

  async getPipelineByPipelineId(
    pipelineId: string,
    throwError = true
  ): Promise<CreatedPipeline | undefined> {
    const command = new QueryCommand({
      TableName: process.env.DB_PIPELINES_TABLE_NAME!,
      KeyConditionExpression: 'pipelineId = :value',
      ExpressionAttributeValues: { ':value': pipelineId }
    })
    const data = await this.docClient.send(command)

    if (data.Items?.[0]) return data.Items[0] as CreatedPipeline

    if (throwError) {
      throw Error(
        `No associated pipeline found with pipelineId = ${pipelineId}`
      )
    }
  }

  async updatePipeline(
    rawPipeline: Partial<RawPipeline>
  ): Promise<CreatedPipeline> {
    const { pipelineId, createdAt } =
      (await this.getPipelineCompositeKeyByCommitSha(rawPipeline.sha!))!

    const command = new UpdateCommand({
      TableName: process.env.DB_PIPELINES_TABLE_NAME!,
      Key: { pipelineId: pipelineId!, createdAt },
      UpdateExpression:
        'set #status = :statusValue, #total = :totalValue, #totalFailed = :totalFailedValue, #totalPassed = :totalPassedValue, #artifactsUrl = :artifactsUrlValue',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#total': 'total',
        '#totalFailed': 'totalFailed',
        '#totalPassed': 'totalPassed',
        '#artifactsUrl': 'artifactsUrl'
      },
      ExpressionAttributeValues: {
        ':statusValue': rawPipeline.status,
        ':totalValue': rawPipeline.total,
        ':totalFailedValue': rawPipeline.totalFailed,
        ':totalPassedValue': rawPipeline.totalPassed,
        ':artifactsUrlValue': rawPipeline.artifactsUrl
      },
      ReturnValues: 'ALL_NEW'
    })
    const data = await this.docClient.send(command)

    return data.Attributes! as CreatedPipeline
  }
}

export const dynamoDb = new DynamoDbHelpers()
