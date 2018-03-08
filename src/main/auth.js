import Mastodon from 'mastodon-api'
import storage from 'electron-json-storage'

const appName = 'whalebird'
const scope = 'read write follow'

export default class Authentication {
  constructor (baseURL = 'https://mstdn.jp') {
    this.baseURL = baseURL
    this.clientId = ''
    this.clientSecret = ''
  }

  getAuthorizationUrl () {
    return Mastodon.createOAuthApp(this.baseURL + '/api/v1/apps', appName, scope)
      .catch(err => console.error(err))
      .then((res) => {
        this.clientId = res.client_id
        this.clientSecret = res.client_secret

        const json = {
          clientId: this.clientId,
          clientSecret: this.clientSecret
        }
        storage.set('client', json, (err) => {
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
          const json = {
            accessToken: token
          }
          storage.set('token', json, (err) => {
            reject(err)
          })
          resolve(token)
        })
    })
  }

  // TODO: Refresh access token when expired
}
