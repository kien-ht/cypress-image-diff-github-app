interface MiddleWareData {
  userId: string
}
export interface GithubUserInfo {
  // This is a brief interface represents only what we need
  login: string
  id: number
  avatar_url: string
  html_url: string
}

declare module '@netlify/functions' {
  interface HandlerEvent {
    middleware?: MiddleWareData
  }
}
