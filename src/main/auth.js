import Mastodon from 'mastodon-api'
import empty from 'is-empty'

const appName = 'whalebird'
const scope = 'read write follow'

export default class Authentication {
  constructor (db, baseURL = 'https://mstdn.jp') {
    this.db = db
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
          baseURL: this.baseURL,
          clientId: this.clientId,
          clientSecret: this.clientSecret
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
          this.db.findOne(
            {
              baseURL: this.baseURL,
              clientId: this.clientId,
              clientSecret: this.clientSecret
            },
            (err, doc) => {
              if (err) return reject(err)
              const json = Object.assign(doc, {
                accessToken: token
              })
              this.db.update(doc, json, (err, _) => {
                if (err) return reject(err)
                resolve(token)
              })
            }
          )
        })
    })
  }

  listInstances () {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, doc) => {
        if (err) return reject(err)
        if (empty(doc)) reject(new EmptyTokenError('empty'))
        const instances = doc.map((e, i, array) => {
          return e.baseURL
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
