import { Handler } from '@netlify/functions'

import { GithubController } from './github-controller'

export const getPublicConfigHandler: Handler = async () => {
  try {
    const controller = new GithubController()
    const config = controller.getPublicConfig()
    return {
      statusCode: 200,
      body: JSON.stringify(config)
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
