import Mastodon from 'megalodon'
import log from 'electron-log'

export default class Streaming {
  constructor (account) {
    this.account = account
    this.client = new Mastodon(
      account.accessToken,
      account.baseURL + '/api/v1'
    )
    this.listener = null
  }

  startUserStreaming (updateCallback, notificationCallback, errCallback) {
    this.listener = this.client.stream('/streaming/user')
    log.info('/streaming/user started')

    this.listener.on('update', (status) => {
      updateCallback(status)
    })

    this.listener.on('notification', (notification) => {
      notificationCallback(notification)
    })

    this.listener.on('error', (err) => {
      errCallback(err)
    })
  }

  start (path, updateCallback, errCallback) {
    this.listener = this.client.stream(path)
    log.info(`${path} started`)

    this.listener.on('update', (status) => {
      updateCallback(status)
    })

    this.listener.on('error', (err) => {
      errCallback(err)
    })
  }

  stop () {
    this.listener.stop()
    log.info('streaming stopped')
  }
}
