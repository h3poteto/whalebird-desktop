import { Account } from '@/db'
import generator, { Entity, MegalodonInterface, WebSocketInterface } from 'megalodon'
import { useEffect, useState, useCallback, useRef, Dispatch, SetStateAction } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'
import Notification from './notification/Notification'
import { Spinner } from '@material-tailwind/react'
import { useRouter } from 'next/router'
import Detail from '../detail/Detail'
import { Marker } from '@/entities/marker'
import { FaCheck } from 'react-icons/fa6'
import { useToast } from '@/provider/toast'
import { useUnreads } from '@/provider/unreads'

const TIMELINE_STATUSES_COUNT = 30
const TIMELINE_MAX_STATUSES = 2147483647

type Props = {
  account: Account
  client: MegalodonInterface
  setAttachment: Dispatch<SetStateAction<Entity.Attachment | null>>
}

export default function Notifications(props: Props) {
  const [notifications, setNotifications] = useState<Array<Entity.Notification>>([])
  const [unreadNotifications, setUnreadNotifications] = useState<Array<Entity.Notification>>([])
  const [firstItemIndex, setFirstItemIndex] = useState(TIMELINE_MAX_STATUSES)
  const [marker, setMarker] = useState<Marker | null>(null)
  const [pleromaUnreads, setPleromaUnreads] = useState<Array<string>>([])
  const [filters, setFilters] = useState<Array<Entity.Filter>>([])

  const scrollerRef = useRef<HTMLElement | null>(null)
  const streaming = useRef<WebSocketInterface | null>(null)
  const router = useRouter()
  const showToast = useToast()
  const { setUnreads } = useUnreads()
  const { formatMessage } = useIntl()

  useEffect(() => {
    const f = async () => {
      const f = await loadFilter(props.client)
      setFilters(f)
      const res = await loadNotifications(props.client)
      setNotifications(res)
      const instance = await props.client.getInstance()
      const c = generator(props.account.sns, instance.data.urls.streaming_api, props.account.access_token, 'Whalebird')
      updateMarker(props.client)
      streaming.current = c.userSocket()
      streaming.current.on('connect', () => {
        console.log('connected to notifications')
      })
      streaming.current.on('notification', (notification: Entity.Notification) => {
        if (scrollerRef.current && scrollerRef.current.scrollTop > 10) {
          setUnreadNotifications(current => [notification, ...current])
        } else {
          setNotifications(current => [notification, ...current])
        }
        updateMarker(props.client)
      })
    }
    f()

    return () => {
      setUnreadNotifications([])
      setFirstItemIndex(TIMELINE_MAX_STATUSES)
      setNotifications([])
      if (streaming.current) {
        streaming.current.removeAllListeners()
        streaming.current.stop()
        streaming.current = null
        console.log('closed notifications')
      }
    }
  }, [props.client])

  useEffect(() => {
    // In pleroma, last_read_id is incorrect.
    // Items that have not been marked may also be read. So, if marker has unread_count, we should use it for unreads.
    if (marker && marker.unread_count) {
      const allNotifications = unreadNotifications.concat(notifications)
      const u = allNotifications.slice(0, marker.unread_count).map(n => n.id)
      setPleromaUnreads(u)
    }
  }, [marker, unreadNotifications, notifications])

  const loadFilter = async (client: MegalodonInterface): Promise<Array<Entity.Filter>> => {
    const res = await client.getFilters()
    return res.data.filter(f => f.context.includes('notifications'))
  }

  const loadNotifications = async (client: MegalodonInterface, maxId?: string): Promise<Array<Entity.Notification>> => {
    let options = { limit: 30 }
    if (maxId) {
      options = Object.assign({}, options, { max_id: maxId })
    }
    const res = await client.getNotifications(options)
    return res.data
  }

  const updateMarker = async (client: MegalodonInterface) => {
    try {
      const res = await client.getMarkers(['notifications'])
      const marker = res.data as Entity.Marker
      if (marker.notifications) {
        setMarker(marker.notifications)
      }
    } catch (err) {
      console.error(err)
    }
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

  const read = async () => {
    try {
      await props.client.saveMarkers({ notifications: { last_read_id: notifications[0].id } })
      if (props.account.sns === 'pleroma') {
        await props.client.readNotifications({ max_id: notifications[0].id })
      }
      const res = await props.client.getMarkers(['notifications'])
      const marker = res.data as Entity.Marker
      if (marker.notifications) {
        setMarker(marker.notifications)
        setUnreads(current =>
          Object.assign({}, current, {
            [props.account.id?.toString()]: 0
          })
        )
      }
    } catch {
      showToast({ text: formatMessage({ id: 'alert.failed_mark' }), type: 'failure' })
    }
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
    const u = unreadNotifications.slice().reverse().slice(0, TIMELINE_STATUSES_COUNT).reverse()
    const remains = u.slice(0, -1 * TIMELINE_STATUSES_COUNT)
    setUnreadNotifications(() => remains)
    setFirstItemIndex(() => firstItemIndex - u.length)
    setNotifications(() => [...u, ...notifications])
    return false
  }, [firstItemIndex, notifications, setNotifications, unreadNotifications])

  const timelineClass = () => {
    if (router.query.detail) {
      return 'timeline-with-drawer'
    }
    return 'timeline'
  }

  return (
    <div className="flex timeline-wrapper">
      <section className={`h-full ${timelineClass()}`}>
        <div className="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
          <div className="text-lg font-bold">
            <FormattedMessage id="timeline.notifications" />
          </div>
          <div className="w-64 text-xs text-right">
            <button className="text-gray-400 text-base py-1" title={formatMessage({ id: 'timeline.mark_as_read' })} onClick={read}>
              <FaCheck />
            </button>
          </div>
        </div>
        <div className="timeline overflow-y-auto w-full overflow-x-hidden" style={{ height: 'calc(100% - 44px)' }}>
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
              itemContent={(_, notification) => {
                let shadow = {}
                if (marker) {
                  if (marker.unread_count && pleromaUnreads.includes(notification.id)) {
                    shadow = { boxShadow: '4px 0 2px var(--tw-shadow-color) inset' }
                  } else if (parseInt(marker.last_read_id) < parseInt(notification.id)) {
                    shadow = { boxShadow: '4px 0 2px var(--tw-shadow-color) inset' }
                  }
                }

                return (
                  <div className="box-border shadow-teal-500/80" style={shadow}>
                    <Notification
                      client={props.client}
                      account={props.account}
                      notification={notification}
                      onRefresh={updateStatus}
                      key={notification.id}
                      openMedia={media => props.setAttachment(media)}
                      filters={filters}
                    />
                  </div>
                )
              }}
            />
          ) : (
            <div className="w-full pt-6" style={{ height: '100%' }}>
              <Spinner className="m-auto" />
            </div>
          )}
        </div>
      </section>
      <Detail client={props.client} account={props.account} className="detail" openMedia={media => props.setAttachment(media)} />
    </div>
  )
}
