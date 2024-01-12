import { Account } from '@/db'
import generator, { Entity, MegalodonInterface, WebSocketInterface } from 'megalodon'
import { useEffect, useState, useCallback, useRef, Dispatch, SetStateAction } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'
import Notification from './notification/Notification'
import { Input, Spinner } from '@material-tailwind/react'

const TIMELINE_STATUSES_COUNT = 30
const TIMELINE_MAX_STATUSES = 2147483647

type Props = {
  account: Account
  client: MegalodonInterface
  setAttachment: Dispatch<SetStateAction<Entity.Attachment | null>>
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
    <section className="h-full timeline-wrapper">
      <div className="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
        <div className="text-lg font-bold">
          <FormattedMessage id="timeline.notifications" />
        </div>
        <div className="w-64 text-xs">
          <form>
            <Input type="text" placeholder={formatMessage({ id: 'timeline.search' })} disabled />
          </form>
        </div>
      </div>
      <div className="timeline overflow-y-auto w-full overflow-x-hidden" style={{ height: 'calc(100% - 50px)' }}>
        {notifications.length > 0 ? (
          <Virtuoso
            style={{ height: '100%' }}
            scrollerRef={ref => {
              scrollerRef.current = ref as HTMLElement
            }}
            firstItemIndex={firstItemIndex}
            atTopStateChange={prependUnreads}
            className="timeline-scrollable"
            data={notifications}
            endReached={loadMore}
            itemContent={(_, notification) => (
              <Notification
                client={props.client}
                account={props.account}
                notification={notification}
                onRefresh={updateStatus}
                key={notification.id}
                openMedia={media => props.setAttachment(media)}
              />
            )}
          />
        ) : (
          <div className="w-full pt-6" style={{ height: '100%' }}>
            <Spinner className="m-auto" />
          </div>
        )}
      </div>
    </section>
  )
}
