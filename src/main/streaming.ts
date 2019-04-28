import Mastodon, { StreamListener, Status, Notification } from 'megalodon'
import log from 'electron-log'
import LocalAccount from '~/src/types/localAccount'

export default class Streaming {
  private client: Mastodon
  private listener: StreamListener | null

  constructor (account: LocalAccount) {
    this.client = new Mastodon(
      account.accessToken!,
      account.baseURL + '/api/v1'
    )
    this.listener = null
  }

  startUserStreaming (updateCallback: Function, notificationCallback: Function, errCallback: Function) {
    this.listener = this.client.stream('/streaming/user')

    this.listener.on('connect', _ => {
      log.info('/streaming/user started')
    })

    this.listener.on('update', (status: Status) => {
      updateCallback(status)
    })

    this.listener.on('notification', (notification: Notification) => {
      notificationCallback(notification)
    })

    this.listener.on('error', (err: Error) => {
      errCallback(err)
    })

    this.listener.on('connection-limit-exceeded', (err: Error) => {
      errCallback(err)
    })
  }

  start (path: string, updateCallback: Function, errCallback: Function) {
    this.listener = this.client.stream(path)
    this.listener.on('connect', _ => {
      log.info(`${path} started`)
    })

    this.listener.on('update', (status: Status) => {
      updateCallback(status)
    })

    this.listener.on('error', (err: Error) => {
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
      this.listener.on('error', (e: Error) => {
        log.error(e)
      })
      this.listener.on('parser-error', (e: Error) => {
        log.error(e)
      })
      this.listener.stop()
      log.info('streaming stopped')
    }
  }
}
