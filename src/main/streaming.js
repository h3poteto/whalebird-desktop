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

    this.listener.on('connect', _ => {
      log.info('/streaming/user started')
    })

    this.listener.on('update', (status) => {
      updateCallback(status)
    })

    this.listener.on('notification', (notification) => {
      notificationCallback(notification)
    })

    this.listener.on('error', (err) => {
      errCallback(err)
    })

    this.listener.on('connection-limit-exceeded', err => {
      errCallback(err)
    })
  }

  start (path, updateCallback, errCallback) {
    this.listener = this.client.stream(path)
    this.listener.on('connect', _ => {
      log.info(`${path} started`)
    })

    this.listener.on('update', (status) => {
      updateCallback(status)
    })

    this.listener.on('error', (err) => {
      errCallback(err)
    })

    this.listener.on('connection-limit-exceeded', err => {
      errCallback(err)
    })
  }

  stop () {
    if (this.listener) {
      this.listener.removeAllListeners('connect')
      this.listener.removeAllListeners('update')
      this.listener.removeAllListeners('notification')
      this.listener.removeAllListeners('error')
      this.listener.removeAllListeners('parser-error')
      this.listener.on('error', (e) => {
        log.error(e)
      })
      this.listener.stop()
      log.info('streaming stopped')
    }
  }
}
