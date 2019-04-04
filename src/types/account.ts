export default interface Account {
  _id?: string,
  baseURL: string,
  domain: string,
  clientId: string,
  clientSecret: string,
  accessToken: string | null,
  refreshToken: string | null,
  username: string | null,
  accountId: number | null,
  avatar: string | null,
  order: number
}
