import generator, { MegalodonInterface, WebSocketInterface, Entity, ProxyConfig } from 'megalodon'
import log from 'electron-log'
import { LocalAccount } from '~/src/types/localAccount'

const StreamingURL = async (
  sns: 'mastodon' | 'pleroma' | 'misskey',
  account: LocalAccount,
  proxy: ProxyConfig | false
): Promise<string> => {
  if (!account.accessToken) {
    throw new Error('access token is empty')
  }
  const client = generator(sns, account.baseURL, account.accessToken, 'Whalebird', proxy)
  const res = await client.getInstance()
  return res.data.urls.streaming_api
}

export { StreamingURL }

class WebSocket {
  public client: MegalodonInterface
  public listener: WebSocketInterface | null

  constructor(sns: 'mastodon' | 'pleroma' | 'misskey', account: LocalAccount, streamingURL: string, proxy: ProxyConfig | false) {
    const url = streamingURL.replace(/^https:\/\//, 'wss://')
    this.client = generator(sns, url, account.accessToken, 'Whalebird', proxy)
    this.listener = null
  }

  public bindListener(updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    if (!this.listener) {
      log.error('listener does not exist')
      return
    }

    this.listener.on('update', (status: Entity.Status) => {
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

  public stop() {
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

export class UserStreaming extends WebSocket {
  public start(updateCallback: Function, notificationCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.listener = this.client.userSocket()

    this.listener.on('connect', _ => {
      log.info('user streaming is started')
    })

    this.listener.on('notification', (notification: Entity.Notification) => {
      notificationCallback(notification)
    })

    this.bindListener(updateCallback, deleteCallback, errCallback)
  }
}

export class DirectStreaming extends WebSocket {
  public start(updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.listener = this.client.directSocket()

    this.listener.on('connect', _ => {
      log.info('direct streaming is started')
    })

    this.bindListener(updateCallback, deleteCallback, errCallback)
  }
}

export class LocalStreaming extends WebSocket {
  public start(updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.listener = this.client.localSocket()

    this.listener.on('connect', _ => {
      log.info('local streaming is started')
    })

    this.bindListener(updateCallback, deleteCallback, errCallback)
  }
}

export class PublicStreaming extends WebSocket {
  public start(updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.listener = this.client.publicSocket()

    this.listener.on('connect', _ => {
      log.info('public streaming is started')
    })

    this.bindListener(updateCallback, deleteCallback, errCallback)
  }
}

export class ListStreaming extends WebSocket {
  public start(listID: string, updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.listener = this.client.listSocket(listID)

    this.listener.on('connect', _ => {
      log.info('list streaming is started')
    })

    this.bindListener(updateCallback, deleteCallback, errCallback)
  }
}

export class TagStreaming extends WebSocket {
  public start(tag: string, updateCallback: Function, deleteCallback: Function, errCallback: Function) {
    this.listener = this.client.tagSocket(tag)

    this.listener.on('connect', _ => {
      log.info('tag streaming is started')
    })

    this.bindListener(updateCallback, deleteCallback, errCallback)
  }
}
