import Mastodon from 'mstdn-api'

const appName = 'Whalebird'
const appURL = 'https://whalebird.org'
const scope = [Mastodon.Scope.READ, Mastodon.Scope.WRITE, Mastodon.Scope.FOLLOW]

export default class Authentication {
  constructor (accountDB) {
    this.db = accountDB
    this.baseURL = ''
    this.domain = ''
    this.clientId = ''
    this.clientSecret = ''
    this.protocol = 'https'
  }

  setOtherInstance (domain) {
    this.baseURL = `${this.protocol}://${domain}`
    this.domain = domain
    this.clientId = ''
    this.clientSecret = ''
  }

  async getAuthorizationUrl (domain = 'mastodon.social') {
    this.setOtherInstance(domain)
    const appData = await Mastodon.registerApp(
      appName,
      {
        scopes: scope,
        redirect_urls: 'urn:ietf:wg:oauth:2.0:oob',
        website: appURL
      },
      this.baseUrl
    )
    this.clientId = appData.clientId
    this.clientSecret = appData.clientSecret

    const count = await this.db.countAuthorizedAccounts()
    const json = {
      baseURL: this.baseURL,
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      accessToken: '',
      username: '',
      accountId: '',
      avatar: '',
      order: count + 1
    }
    await this.db.insertAccount(json)
    return appData.url
  }

  async getAccessToken (code) {
    const tokenData = await Mastodon.fetchAccessToken(this.clientId, this.clientSecret, code, 'urn:ietf:wg:oauth:2.0:oob', this.baseURL)
    const search = {
      baseURL: this.baseURL,
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret
    }
    const rec = await this.db.searchAccount(search)
    await this.db.updateAccount(rec._id, { accessToken: tokenData.accessToken })
    return tokenData.accessToken
  }
  // TODO: Refresh access token when expired
}
