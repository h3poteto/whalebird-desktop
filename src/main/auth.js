import Mastodon from 'mastodon-api'
import log from 'electron-log'

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

  getAuthorizationUrl (domain = 'mastodon.social') {
    this.setOtherInstance(domain)
    return new Promise((resolve, reject) => {
      Mastodon.createOAuthApp(this.baseURL + '/api/v1/apps', appName, scope)
        .catch(err => log.error(err))
        .then((res) => {
          this.clientId = res.client_id
          this.clientSecret = res.client_secret

          // TODO: Save order number
          const json = {
            baseURL: this.baseURL,
            domain: this.domain,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            accessToken: '',
            username: '',
            accountId: ''
          }
          this.db.insertAccount(json)
            .then((doc) => {
              Mastodon.getAuthorizationUrl(this.clientId, this.clientSecret, this.baseURL)
                .then((url) => {
                  resolve(url)
                })
                .catch((err) => {
                  reject(err)
                })
            })
            .catch((err) => {
              reject(err)
            })
        })
    })
  }

  getAccessToken (code) {
    return new Promise((resolve, reject) => {
      Mastodon.getAccessToken(this.clientId, this.clientSecret, code, this.baseURL)
        .catch(err => reject(err))
        .then((token) => {
          const search = {
            baseURL: this.baseURL,
            domain: this.domain,
            clientId: this.clientId,
            clientSecret: this.clientSecret
          }
          this.db.searchAccount(search)
            .then((rec) => {
              this.db.updateAccount(rec._id, { accessToken: token })
                .then((doc) => {
                  resolve(token)
                })
                .catch(err => reject(err))
            })
        })
    })
  }
  // TODO: Refresh access token when expired
}
