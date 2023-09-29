export type LocalServer = {
  id: number
  baseURL: string
  domain: string
  sns: 'mastodon' | 'pleroma'
  accountId: number | null
}
