import Streaming from './streaming'
import WebSocket from './websocket'

export default class StreamingManager {
  constructor (account, useWebsocket = false) {
    this.account = account
    this.streaming = new Streaming(account)
    this.websocket = new WebSocket(account)
    this.useWebsocket = useWebsocket
  }

  startUser (updateCallback, notificationCallback, errCallback) {
    if (this.useWebsocket) {
      this._startUserSocket(updateCallback, notificationCallback, errCallback)
    } else {
      this._startUserStreaming(updateCallback, notificationCallback, errCallback)
    }
  }

  start (path, params, updateCallback, errCallback) {
    if (this.useWebsocket) {
      this._startSocket(path, params, updateCallback, errCallback)
    } else {
      this._startStreaming(path, params, updateCallback, errCallback)
    }
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
