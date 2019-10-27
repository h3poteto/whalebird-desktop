import Mastodon, { WebSocket as SocketListener, Status, Notification, Instance, Response, ProxyConfig } from 'megalodon'
import log from 'electron-log'
import { LocalAccount } from '~/src/types/localAccount'

const StreamingURL = async (account: LocalAccount, proxy: ProxyConfig | false): Promise<string> => {
  if (!account.accessToken) {
    throw new Error('access token is empty')
  }
  const client = new Mastodon(account.accessToken, account.baseURL + '/api/v1', 'Whalebird', proxy)
  const res: Response<Instance> = await client.get<Instance>('/instance')
  return res.data.urls.streaming_api
}

export { StreamingURL }

export default class WebSocket {
  private client: Mastodon
  private listener: SocketListener | null

  constructor(account: LocalAccount, streamingURL: string) {
    const url = streamingURL.replace(/^https:\/\//, 'wss://')
    this.client = new Mastodon(account.accessToken!, url + '/api/v1')
    this.listener = null
  }

  startUserStreaming(updateCallback: Function, notificationCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.listener = this.client.socket('/streaming', 'user')

    this.listener.on('connect', _ => {
      log.info('/streaming/?stream=user started')
    })

    this.listener.on('update', (status: Status) => {
      updateCallback(status)
    })

    this.listener.on('notification', (notification: Notification) => {
      notificationCallback(notification)
    })

    this.listener.on('delete', (id: string) => {
      deleteCallback(id)
    })

    this.listener.on('error', (err: Error) => {
      errCallback(err)
    })

    this.listener.on('parser-error', (err: Error) => {
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
  start(stream: string, updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.listener = this.client.socket('/streaming', stream)
    this.listener.on('connect', _ => {
      log.info(`/streaming/?stream=${stream} started`)
    })

    this.listener.on('update', (status: Status) => {
      updateCallback(status)
    })

    this.listener.on('delete', (id: string) => {
      deleteCallback(id)
    })

    this.listener.on('error', (err: Error) => {
      errCallback(err)
    })

    this.listener.on('parser-error', (err: Error) => {
      errCallback(err)
    })
  }

  stop() {
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
