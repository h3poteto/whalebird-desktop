import Mastodon from 'mastodon-api'

const appName = 'whalebird'
const scope = 'read write follow'
const redirectURI = 'urn:ietf:wg:oauth:2.0:oob'

export default class Authentication {
  constructor (baseURL = 'https://mstdn.jp') {
    this.baseURL = baseURL
    this.clientId = ''
    this.clientSecret = ''
  }

  getAuthorizationUrl () {
    return Mastodon.createOAuthApp(this.baseURL + '/api/v1/apps', appName, scope, redirectURI)
      .catch(err => console.error(err))
      .then((res) => {
        console.log('Please save \'id\', \'client_id\' and \'client_secret\' in your program and use it from now on!')
        console.log(res)

        this.clientId = res.client_id
        this.clientSecret = res.client_secret

        return Mastodon.getAuthorizationUrl(this.clientId, this.clientSecret, this.baseURL, scope, redirectURI)
      })
  }

  getAccessToken (code) {
    console.log(code)
    console.log(this.clientId)
    console.log(this.clientSecret)
    console.log(this.baseURL)
    return Mastodon.getAccessToken(this.clientId, this.clientSecret, code, this.baseURL)
  }
}
