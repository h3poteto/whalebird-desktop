import Mastodon, { OAuth } from 'megalodon'
import Account from './account'
import LocalAccount from '~/src/types/localAccount'

const appName = 'Whalebird'
const appURL = 'https://whalebird.org'
const scope = 'read write follow'

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

  async getAuthorizationUrl(domain = 'mastodon.social'): Promise<string> {
    this.setOtherInstance(domain)
    const res = await Mastodon.registerApp(
      appName,
      {
        scopes: scope,
        website: appURL
      },
      this.baseURL
    )
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
      refreshToken: '',
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

  async getAccessToken(code: string): Promise<string> {
    const tokenData: OAuth.TokenData = await Mastodon.fetchAccessToken(this.clientId, this.clientSecret, code, this.baseURL)
    const search = {
      baseURL: this.baseURL,
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret
    }
    const rec = await this.db.searchAccount(search)
    const accessToken = tokenData.accessToken
    const refreshToken = tokenData.refreshToken
    const data = await this.db.fetchAccount(rec, accessToken)
    await this.db.updateAccount(rec._id!, {
      username: data.username,
      accountId: data.id,
      avatar: data.avatar,
      accessToken: accessToken,
      refreshToken: refreshToken
    })
    return accessToken
  }

  async updateAccessToken(id: string): Promise<string> {
    const account = await this.db.getAccount(id)
    if (!account.refreshToken) {
      throw new RefreshTokenDoesNotExist()
    }
    const data: OAuth.TokenData = await Mastodon.refreshToken(account.clientId, account.clientSecret, account.refreshToken, account.baseURL)
    await this.db.updateAccount(id, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    })
    return data.access_token
  }
}

class AuthenticationURLError extends Error {}
class RefreshTokenDoesNotExist extends Error {}
