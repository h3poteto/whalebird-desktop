export type LocalAccount = {
  id: number
  username: string
  accountId: string
  avatar: string
  clientId: string | null
  clientSecret: string
  accessToken: string
  refreshToken: string | null
  order: number
}
