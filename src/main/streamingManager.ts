import Streaming from './streaming'
import WebSocket from './websocket'
import { LocalAccount } from '~/src/types/localAccount'

export default class StreamingManager {
  private streaming: Streaming
  private websocket: WebSocket
  private useWebsocket: boolean

  constructor(account: LocalAccount, useWebsocket = false) {
    this.streaming = new Streaming(account)
    this.websocket = new WebSocket(account)
    this.useWebsocket = useWebsocket
  }

  startUser(updateCallback: Function, notificationCallback: Function, deleteCallback: Function, errCallback: Function) {
    if (this.useWebsocket) {
      this._startUserSocket(updateCallback, notificationCallback, deleteCallback, errCallback)
    } else {
      this._startUserStreaming(updateCallback, notificationCallback, deleteCallback, errCallback)
    }
  }

  start(path: string, params: string, updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    if (this.useWebsocket) {
      this._startSocket(path, params, updateCallback, deleteCallback, errCallback)
    } else {
      this._startStreaming(path, params, updateCallback, deleteCallback, errCallback)
    }
  }

  stop() {
    this._stopStreaming()
    this._stopSocket()
  }

  /**
   * Using streaming for Mastodon
   */
  _startUserStreaming(updateCallback: Function, notificationCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.streaming.startUserStreaming(updateCallback, notificationCallback, deleteCallback, errCallback)
  }

  _startStreaming(path: string, params: string, updateCallback: Function, deleteCallback, errCallback: Function) {
    const target = `/streaming/${path}?${params}`
    this.streaming.start(target, updateCallback, deleteCallback, errCallback)
  }

  _stopStreaming() {
    this.streaming.stop()
  }

  /**
   * Using websocket for Pleroma
   */
  _startUserSocket(updateCallback: Function, notificationCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.websocket.startUserStreaming(updateCallback, notificationCallback, deleteCallback, errCallback)
  }

  _startSocket(path: string, params: string, updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    let stream = path
    if (stream === 'public/local') {
      stream = 'public:local'
    }
    this.websocket.start(`${stream}&${params}`, updateCallback, deleteCallback, errCallback)
  }

  _stopSocket() {
    this.websocket.stop()
  }
}
