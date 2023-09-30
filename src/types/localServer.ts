export type LocalServer = {
  id: number
  baseURL: string
  domain: string
  sns: 'mastodon' | 'pleroma' | 'firefish' | 'friendica'
  accountId: number | null
}
