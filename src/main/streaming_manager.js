import Mastodon from 'megalodon'
import Streaming from './streaming'
import WebSocket from './websocket'
import log from 'electron-log'

export default class StreamingManager {
  constructor (account) {
    this.account = account
    this.streaming = new Streaming(account)
    this.websocket = new WebSocket(account)
    this.mastodon = true
  }

  /**
   * Find Pleroma comment in the response
   */
  async detectPleroma () {
    const data = await Mastodon.get('/instance', {}, this.account.baseURL + '/api/v1')
    if (data.version.includes('Pleroma')) {
      this.mastodon = false
      log.info('detect Pleroma')
    }
  }

  startUser (updateCallback, notificationCallback, errCallback) {
    this.detectPleroma()
      .then(() => {
        if (this.mastodon) {
          this._startUserStreaming(updateCallback, notificationCallback, errCallback)
        } else {
          this._startUserSocket(updateCallback, notificationCallback, errCallback)
        }
      })
      .catch(err => errCallback(err))
  }

  start (path, params, updateCallback, errCallback) {
    this.detectPleroma()
      .then(() => {
        if (this.mastodon) {
          this._startStreaming(path, params, updateCallback, errCallback)
        } else {
          this._startSocket(path, params, updateCallback, errCallback)
        }
      })
      .catch(err => errCallback(err))
  }

  stop () {
    this._stopStreaming()
    this._stopSocket()
  }

  /**
   * Using streaming for Mastodon
   */
  _startUserStreaming (updateCallback, notificationCallback, errCallback) {
    this.streaming.startUserStreaming(updateCallback, notificationCallback, errCallback)
  }

  _startStreaming (path, params, updateCallback, errCallback) {
    const target = `/streaming/${path}?${params}`
    this.streaming.start(
      target,
      updateCallback,
      errCallback
    )
  }

  _stopStreaming () {
    this.streaming.stop()
  }

  /**
   * Using websocket for Pleroma
   */
  _startUserSocket (updateCallback, notificationCallback, errCallback) {
    this.websocket.startUserStreaming(updateCallback, notificationCallback, errCallback)
  }

  _startSocket (path, params, updateCallback, errCallback) {
    let stream = path
    if (stream === 'public/local') {
      stream = 'public:local'
    }
    this.websocket.start(
      `${stream}&${params}`,
      updateCallback,
      errCallback
    )
  }

  _stopSocket () {
    this.websocket.stop()
  }
}
