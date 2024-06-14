import { Handler } from '@netlify/functions'
import { PublicConfig } from '../common/types'

export const getPublicConfigHandler: Handler = async () => {
  try {
    const config: PublicConfig = { clientId: process.env.CLIENT_ID! }
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
