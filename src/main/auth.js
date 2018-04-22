import Mastodon from 'mastodon-api'

const appName = 'whalebird'
const scope = 'read write follow'

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
    const res = await Mastodon.createOAuthApp(this.baseURL + '/api/v1/apps', appName, scope)
    this.clientId = res.client_id
    this.clientSecret = res.client_secret

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
    const url = await Mastodon.getAuthorizationUrl(this.clientId, this.clientSecret, this.baseURL)
    return url
  }

  async getAccessToken (code) {
    const token = await Mastodon.getAccessToken(this.clientId, this.clientSecret, code, this.baseURL)
    const search = {
      baseURL: this.baseURL,
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret
    }
    const rec = await this.db.searchAccount(search)
    await this.db.updateAccount(rec._id, { accessToken: token })
    return token
  }
  // TODO: Refresh access token when expired
}
