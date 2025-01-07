import Dexie, { type Table } from 'dexie'

export type Account = {
  id?: number
  username: string
  account_id: string
  avatar: string
  client_id: string
  client_secret: string
  access_token: string
  refresh_token: string | null
  url: string
  domain: string
  sns: 'mastodon' | 'pleroma' | 'friendica' | 'firefish' | 'pixelfed'
}

export class SubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  accounts!: Table<Account>

  constructor() {
    super('whalebird')
    this.version(1).stores({
      accounts: '++id, username, account_id, avatar, client_id, client_secret, access_token, refresh_token, url, domain, sns'
    })
  }
}

export const db = new SubClassedDexie()
