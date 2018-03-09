import Mastodon from 'mastodon-api'
import empty from 'is-empty'

const appName = 'whalebird'
const scope = 'read write follow'

export default class Authentication {
  constructor (db) {
    this.db = db
    this.baseURL = ''
    this.clientId = ''
    this.clientSecret = ''
  }

  setOtherInstance (baseURL) {
    this.baseURL = baseURL
    this.clientId = ''
    this.clientSecret = ''
  }

  getAuthorizationUrl (baseURL = 'https://mastodon.social') {
    this.setOtherInstance(baseURL)
    return Mastodon.createOAuthApp(this.baseURL + '/api/v1/apps', appName, scope)
      .catch(err => console.error(err))
      .then((res) => {
        this.clientId = res.client_id
        this.clientSecret = res.client_secret

        const json = {
          baseURL: this.baseURL,
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

  // TODO: このクラスにいる必要性がない，外に出したい
  listInstances () {
    return new Promise((resolve, reject) => {
      this.db.find({accessToken: { $ne: '' }}, (err, doc) => {
        if (err) return reject(err)
        if (empty(doc)) reject(new EmptyTokenError('empty'))
        const instances = doc.map((e, i, array) => {
          return { baseURL: e.baseURL, id: e._id }
        })
        resolve(instances)
      })
    })
  }

  loadTokenFromLocal () {
    return new Promise((resolve, reject) => {
      this.db.findOne(
        {
          baseURL: this.baseURL
        },
        (err, doc) => {
          if (err) return reject(err)
          return resolve(doc.accessToken)
        }
      )
    })
  }
  // TODO: Refresh access token when expired
}

class EmptyTokenError {
  constructor (message) {
    this.message = message
  }
}
