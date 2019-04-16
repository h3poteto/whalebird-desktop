import Streaming from './streaming'
import WebSocket from './websocket'
import LocalAccount from '~src/types/localAccount'

export default class StreamingManager {
  private streaming: Streaming
  private websocket: WebSocket
  private useWebsocket: boolean

  constructor (account: LocalAccount, useWebsocket = false) {
    this.streaming = new Streaming(account)
    this.websocket = new WebSocket(account)
    this.useWebsocket = useWebsocket
  }

  startUser (updateCallback: Function, notificationCallback: Function, errCallback: Function) {
    if (this.useWebsocket) {
      this._startUserSocket(updateCallback, notificationCallback, errCallback)
    } else {
      this._startUserStreaming(updateCallback, notificationCallback, errCallback)
    }
  }

  start (path: string, params: string, updateCallback: Function, errCallback: Function) {
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
  _startUserStreaming (updateCallback: Function, notificationCallback: Function, errCallback: Function) {
    this.streaming.startUserStreaming(updateCallback, notificationCallback, errCallback)
  }

  _startStreaming (path: string, params: string, updateCallback: Function, errCallback: Function) {
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
  _startUserSocket (updateCallback: Function, notificationCallback: Function, errCallback: Function) {
    this.websocket.startUserStreaming(updateCallback, notificationCallback, errCallback)
  }

  _startSocket (path: string, params: string, updateCallback: Function, errCallback: Function) {
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
