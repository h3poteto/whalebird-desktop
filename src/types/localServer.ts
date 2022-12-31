export type LocalServer = {
  id: number
  baseURL: string
  domain: string
  sns: 'mastodon' | 'pleroma' | 'misskey'
  accountId: number | null
}
