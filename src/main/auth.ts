import generator, { ProxyConfig } from 'megalodon'
import crypto from 'crypto'
import Account from './account'
import { LocalAccount } from '~/src/types/localAccount'

const appName = 'Whalebird'
const appURL = 'https://whalebird.org'

export default class Authentication {
  private db: Account
  private baseURL: string | null = null
  private domain: string | null = null
  private clientId: string | null = null
  private clientSecret: string | null = null
  private sessionToken: string | null = null
  private protocol: 'http' | 'https'

  constructor(accountDB: Account) {
    this.db = accountDB
    this.protocol = 'https'
  }

  setOtherInstance(domain: string) {
    this.baseURL = `${this.protocol}://${domain}`
    this.domain = domain
    this.clientId = null
    this.clientSecret = null
  }

  async getAuthorizationUrl(
    sns: 'mastodon' | 'pleroma' | 'misskey',
    domain: string = 'mastodon.social',
    proxy: ProxyConfig | false
  ): Promise<string> {
    this.setOtherInstance(domain)
    if (!this.baseURL || !this.domain) {
      throw new Error('domain is required')
    }
    const client = generator(sns, this.baseURL, null, 'Whalebird', proxy)
    const res = await client.registerApp(appName, {
      website: appURL
    })
    this.clientId = res.clientId
    this.clientSecret = res.clientSecret
    this.sessionToken = res.session_token

    const order = await this.db
      .lastAccount()
      .then(account => account.order + 1)
      .catch(err => {
        console.log(err)
        return 1
      })
    const local: LocalAccount = {
      baseURL: this.baseURL,
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      accessToken: null,
      refreshToken: null,
      username: null,
      accountId: null,
      avatar: null,
      order: order
    }
    await this.db.insertAccount(local)
    if (res.url === null) {
      throw new AuthenticationURLError('Can not get url')
    }
    return res.url
  }

  async getAccessToken(sns: 'mastodon' | 'pleroma' | 'misskey', code: string | null, proxy: ProxyConfig | false): Promise<string> {
    if (!this.baseURL) {
      throw new Error('domain is required')
    }
    if (!this.clientSecret) {
      throw new Error('client secret is required')
    }
    const client = generator(sns, this.baseURL, null, 'Whalebird', proxy)

    // In Misskey session token is required instead of authentication code.
    let authCode = code
    if (!code) {
      authCode = this.sessionToken
    }
    if (!authCode) {
      throw new Error('auth code is required')
    }
    const tokenData = await client.fetchAccessToken(this.clientId, this.clientSecret, authCode, 'urn:ietf:wg:oauth:2.0:oob')
    const search = {
      baseURL: this.baseURL,
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret
    }
    const rec = await this.db.searchAccount(search)
    let accessToken = tokenData.accessToken
    // In misskey, access token is sha256(userToken + clientSecret)
    if (sns === 'misskey') {
      accessToken = crypto
        .createHash('sha256')
        .update(tokenData.accessToken + this.clientSecret, 'utf8')
        .digest('hex')
    }
    const refreshToken = tokenData.refreshToken
    const data = await this.db.fetchAccount(sns, rec, accessToken, proxy)
    await this.db.updateAccount(rec._id!, {
      username: data.username,
      accountId: data.id,
      avatar: data.avatar,
      accessToken: accessToken,
      refreshToken: refreshToken
    })
    return accessToken
  }
}

class AuthenticationURLError extends Error {}
