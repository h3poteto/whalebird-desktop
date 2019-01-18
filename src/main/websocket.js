import Mastodon from 'megalodon'
import log from 'electron-log'

export default class WebSocket {
  constructor (account) {
    this.account = account
    const url = account.baseURL.replace(/^https:\/\//, 'wss://')
    this.client = new Mastodon(
      account.accessToken,
      url + '/api/v1'
    )
    this.listener = null
  }

  startUserStreaming (updateCallback, notificationCallback, errCallback) {
    this.listener = this.client.socket('/streaming', 'user')

    this.listener.on('connect', _ => {
      log.info('/streaming/?stream=user started')
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

    this.listener.on('parser-error', (err) => {
      errCallback(err)
    })
  }

  /**
   * Start new custom streaming with websocket.
   * @param stream Path of streaming.
   * @param updateCallback A callback function which is called update.
   * @param errCallback A callback function which ic called error.
   * When local timeline, the path is `public:local`.
   * When public timeline, the path is `public`.
   * When hashtag timeline, the path is `hashtag&tag=tag_name`.
   * When list timeline, the path is `list&list=list_id`.
   */
  start (stream, updateCallback, errCallback) {
    this.listener = this.client.socket('/streaming', stream)
    this.listener.on('connect', _ => {
      log.info(`/streaming/?stream=${stream} started`)
    })

    this.listener.on('update', status => {
      updateCallback(status)
    })

    this.listener.on('error', (err) => {
      errCallback(err)
    })

    this.listener.on('parser-error', (err) => {
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
      this.listener.on('parser-error', (e) => {
        log.error(e)
      })
      this.listener.stop()
      log.info('streaming stopped')
    }
  }
}
