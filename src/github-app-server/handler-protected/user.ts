import { Handler } from '@netlify/functions'

export const getUserHandler: Handler = async () => {
  try {
    return {
      statusCode: 200
      // body: JSON.stringify(json)
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
