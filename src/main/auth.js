import Mastodon from 'mastodon-api'

const appName = 'whalebird'
const scope = 'read write follow'

export default class Authentication {
  constructor (db) {
    this.db = db
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
    return Mastodon.createOAuthApp(this.baseURL + '/api/v1/apps', appName, scope)
      .catch(err => console.error(err))
      .then((res) => {
        this.clientId = res.client_id
        this.clientSecret = res.client_secret

        const json = {
          baseURL: this.baseURL,
          domain: this.domain,
          clientId: this.clientId,
          clientSecret: this.clientSecret,
          accessToken: ''
        }
        this.db.insert(json, (err, _) => {
          if (err) throw err
        })

        return Mastodon.getAuthorizationUrl(this.clientId, this.clientSecret, this.baseURL)
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
          this.db.update(search, {$set: { accessToken: token }}, {}, (err, num) => {
            if (err) return reject(err)
            resolve(token)
          })
        })
    })
  }
  // TODO: Refresh access token when expired
}
