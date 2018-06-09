import Mastodon from 'megalodon'

const appName = 'Whalebird'
const appURL = 'https://whalebird.org'
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
    const res = await Mastodon.registerApp(
      appName, {
        scopes: scope,
        website: appURL
      },
      this.baseURL
    )
    this.clientId = res.clientId
    this.clientSecret = res.clientSecret

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
    return res.url
  }

  async getAccessToken (code) {
    const token = await Mastodon.fetchAccessToken(this.clientId, this.clientSecret, code, this.baseURL)
    const search = {
      baseURL: this.baseURL,
      domain: this.domain,
      clientId: this.clientId,
      clientSecret: this.clientSecret
    }
    const rec = await this.db.searchAccount(search)
    const accessToken = token.access_token
    await this.db.updateAccount(rec._id, { accessToken: accessToken })
    return accessToken
  }
  // TODO: Refresh access token when expired
}
