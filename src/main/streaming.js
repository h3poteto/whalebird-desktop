import Mastodon from 'mastodon-api'

export default class Streaming {
  constructor (account) {
    this.account = account
    this.client = new Mastodon(
      {
        access_token: account.accessToken,
        api_url: account.baseURL + '/api/v1'
      }
    )
    this.listener = null
  }

  startUserStreaming (updateCallback, notificationCallback, errCallback) {
    this.listener = this.client.stream('/streaming/user')

    this.listener.on('message', (msg) => {
      switch (msg.event) {
        case 'update':
          updateCallback(msg.data)
          break
        case 'notification':
          notificationCallback(msg.data)
          break
        default:
          console.log(msg)
          break
      }
    })

    this.listener.on('error', (err) => {
      errCallback(err)
    })
  }

  stop () {
    this.listener.stop()
  }
}
