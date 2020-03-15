import generator, { ProxyConfig, detector } from 'megalodon'
import Account from './account'
import { LocalAccount } from '~/src/types/localAccount'

const appName = 'Whalebird'
const appURL = 'https://whalebird.org'
const scopes = ['read', 'write', 'follow']

export default class Authentication {
  private db: Account
  private baseURL: string
  private domain: string
  private clientId: string
  private clientSecret: string
  private protocol: 'http' | 'https'

  constructor(accountDB: Account) {
    this.db = accountDB
    this.baseURL = ''
    this.domain = ''
    this.clientId = ''
    this.clientSecret = ''
    this.protocol = 'https'
  }

  setOtherInstance(domain: string) {
    this.baseURL = `${this.protocol}://${domain}`
    this.domain = domain
    this.clientId = ''
    this.clientSecret = ''
  }

  async getAuthorizationUrl(domain = 'mastodon.social', proxy: ProxyConfig | false): Promise<string> {
    this.setOtherInstance(domain)
    const sns = await detector(this.baseURL, proxy)
    const client = generator(sns, this.baseURL, null, 'Whalebird', proxy)
    const res = await client.registerApp(appName, {
      scopes: scopes,
      website: appURL
    })
    this.clientId = res.clientId
    this.clientSecret = res.clientSecret

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
      accessToken: '',
      refreshToken: null,
      username: '',
      accountId: null,
      avatar: '',
      order: order
    }
    await this.db.insertAccount(local)
    if (res.url === null) {
      throw new AuthenticationURLError('Can not get url')
    }
    return res.url
  }

  async getAccessToken(code: string, proxy: ProxyConfig | false): Promise<string> {
    const sns = await detector(this.baseURL, proxy)
    const client = generator(sns, this.baseURL, null, 'Whalebird', proxy)
    const tokenData = await client.fetchAccessToken(this.clientId, this.clientSecret, code, 'urn:ietf:wg:oauth:2.0:oob')
    const search = {
      baseURL: this.baseURL,
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret
    }
    const rec = await this.db.searchAccount(search)
    const accessToken = tokenData.accessToken
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
