import { Account } from '@/db'
import { TextInput } from 'flowbite-react'
import generator, { Entity, MegalodonInterface, WebSocketInterface } from 'megalodon'
import { useEffect, useState, useCallback, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'
import Notification from './notification/Notification'

const TIMELINE_STATUSES_COUNT = 30
const TIMELINE_MAX_STATUSES = 2147483647

type Props = {
  account: Account
  client: MegalodonInterface
}

export default function Notifications(props: Props) {
  const [notifications, setNotifications] = useState<Array<Entity.Notification>>([])
  const [unreads, setUnreads] = useState<Array<Entity.Notification>>([])
  const [firstItemIndex, setFirstItemIndex] = useState(TIMELINE_MAX_STATUSES)

  const { formatMessage } = useIntl()
  const scrollerRef = useRef<HTMLElement | null>(null)
  const streaming = useRef<WebSocketInterface | null>(null)

  useEffect(() => {
    const f = async () => {
      const res = await loadNotifications(props.client)
      setNotifications(res)
      const instance = await props.client.getInstance()
      const c = generator(props.account.sns, instance.data.urls.streaming_api, props.account.access_token, 'Whalebird')
      streaming.current = c.userSocket()
      streaming.current.on('connect', () => {
        console.log('connected to notifications')
      })
      streaming.current.on('notification', (notification: Entity.Notification) => {
        if (scrollerRef.current && scrollerRef.current.scrollTop > 10) {
          setUnreads(current => [notification, ...current])
        } else {
          setNotifications(current => [notification, ...current])
        }
      })
    }
    f()

    return () => {
      if (streaming.current) {
        streaming.current.removeAllListeners()
        streaming.current.stop()
        streaming.current = null
        console.log('closed notifications')
      }
    }
  }, [props.client])

  const loadNotifications = async (client: MegalodonInterface, maxId?: string): Promise<Array<Entity.Notification>> => {
    let options = { limit: 30 }
    if (maxId) {
      options = Object.assign({}, options, { max_id: maxId })
    }
    const res = await client.getNotifications(options)
    return res.data
  }

  const updateStatus = (status: Entity.Status) => {
    const renew = notifications.map(n => {
      if (n.status === undefined || n.status === null) {
        return n
      }
      if (n.status.id === status.id) {
        return Object.assign({}, n, { status })
      } else if (n.status.reblog && n.status.reblog.id === status.id) {
        const s = Object.assign({}, n.status, { reblog: status })
        return Object.assign({}, n, { status: s })
      }
      return n
    })
    setNotifications(renew)
  }

  const loadMore = useCallback(async () => {
    console.debug('appending')
    try {
      const append = await loadNotifications(props.client, notifications[notifications.length - 1].id)
      setNotifications(last => [...last, ...append])
    } catch (err) {
      console.error(err)
    }
  }, [props.client, notifications, setNotifications])

  const prependUnreads = useCallback(() => {
    console.debug('prepending')
    const u = unreads.slice().reverse().slice(0, TIMELINE_STATUSES_COUNT).reverse()
    const remains = u.slice(0, -1 * TIMELINE_STATUSES_COUNT)
    setUnreads(() => remains)
    setFirstItemIndex(() => firstItemIndex - u.length)
    setNotifications(() => [...u, ...notifications])
    return false
  }, [firstItemIndex, notifications, setNotifications, unreads])

  return (
    <section className="h-full w-full">
      <div className="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
        <div className="text-lg font-bold">
          <FormattedMessage id="timeline.notifications" />
        </div>
        <div className="w-64 text-xs">
          <form>
            <TextInput type="text" placeholder={formatMessage({ id: 'timeline.search' })} disabled sizing="sm" />
          </form>
        </div>
      </div>
      <div className="timeline overflow-y-auto w-full overflow-x-hidden" style={{ height: 'calc(100% - 50px)' }}>
        <Virtuoso
          style={{ height: '100%' }}
          scrollerRef={ref => {
            scrollerRef.current = ref as HTMLElement
          }}
          firstItemIndex={firstItemIndex}
          atTopStateChange={prependUnreads}
          data={notifications}
          endReached={loadMore}
          itemContent={(_, notification) => (
            <Notification client={props.client} notification={notification} onRefresh={updateStatus} key={notification.id} />
          )}
        />
      </div>
    </section>
  )
}