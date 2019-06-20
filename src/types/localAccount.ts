export type LocalAccount = {
  _id?: string
  baseURL: string
  domain: string
  clientId: string
  clientSecret: string
  accessToken: string | null
  refreshToken: string | null
  username: string | null
  accountId: string | null
  avatar: string | null
  order: number
}
