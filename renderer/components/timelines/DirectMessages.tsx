import { Account } from '@/db'
import { Entity, MegalodonInterface, WebSocketInterface } from 'megalodon'
import { useEffect, useState, useCallback, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'
import Conversation from './status/Conversation'
import { Spinner } from '@material-tailwind/react'
import { useRouter } from 'next/router'
import Detail from '../detail/Detail'
import { FaRotateRight } from 'react-icons/fa6'

const TIMELINE_STATUSES_COUNT = 30
const TIMELINE_MAX_STATUSES = 2147483647

type Props = {
  account: Account
  client: MegalodonInterface
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}

export default function DirectMessages(props: Props) {
  const [directMessages, setDirectMessages] = useState<Array<Entity.Status>>([])
  const [unreadDirectMessages, setUnreadDirectMessages] = useState<Array<Entity.Status>>([])
  const [firstItemIndex, setFirstItemIndex] = useState(TIMELINE_MAX_STATUSES)
  const [filters, setFilters] = useState<Array<Entity.Filter>>([])
  const [reached, setReached] = useState(false)

  const scrollerRef = useRef<HTMLElement | null>(null)
  const streaming = useRef<WebSocketInterface | null>(null)
  const router = useRouter()
  const { formatMessage } = useIntl()

  useEffect(() => {
    const f = async () => {
      const f = await loadFilter(props.client)
      setFilters(f)
      const res = await loadDirectMessages(props.client)
      setDirectMessages(res)
      streaming.current = await props.client.userStreaming()
      streaming.current.on('connect', () => {
        console.log('connected to direct messages')
      })
      streaming.current.on('update', (status: Entity.Status) => {
        if (status.visibility === 'direct') {
          if (scrollerRef.current && scrollerRef.current.scrollTop > 10) {
            setUnreadDirectMessages(current => [status, ...current])
          } else {
            setDirectMessages(current => [status, ...current])
          }
        }
      })
    }
    f()

    return () => {
      setUnreadDirectMessages([])
      setFirstItemIndex(TIMELINE_MAX_STATUSES)
      setDirectMessages([])
      if (streaming.current) {
        streaming.current.removeAllListeners()
        streaming.current.stop()
        streaming.current = null
        console.log('closed direct messages')
      }
    }
  }, [props.client])

  const loadFilter = async (client: MegalodonInterface): Promise<Array<Entity.Filter>> => {
    const res = await client.getFilters()
    return res.data.filter(f => f.context.includes('home'))
  }

  const loadDirectMessages = async (client: MegalodonInterface, maxId?: string): Promise<Array<Entity.Status>> => {
    let options = { limit: 30 }
    if (maxId) {
      options = Object.assign({}, options, { max_id: maxId })
    }
    const res = await client.getConversationTimeline(options)
    return res.data.map(conversation => conversation.last_status).filter(status => status !== null)
  }

  const updateStatus = (status: Entity.Status) => {
    const renew = directMessages.map(s => {
      if (s.id === status.id) {
        return status
      } else if (s.reblog && s.reblog.id === status.id) {
        return Object.assign({}, s, { reblog: status })
      }
      return s
    })
    setDirectMessages(renew)
  }

  const reload = useCallback(async () => {
    const res = await loadDirectMessages(props.client)
    setDirectMessages(res)
  }, [props.client])

  const loadMore = useCallback(async () => {
    if (reached) return
    console.debug('appending')
    try {
      const append = await loadDirectMessages(props.client, directMessages[directMessages.length - 1].id)
      if (append.length === 0) {
        setReached(true)
      }
      setDirectMessages(last => [...last, ...append])
    } catch (err) {
      console.error(err)
    }
  }, [props.client, directMessages, setDirectMessages, reached, setReached])

  const prependUnreads = useCallback(() => {
    console.debug('prepending')
    const u = unreadDirectMessages.slice().reverse().slice(0, TIMELINE_STATUSES_COUNT).reverse()
    const remains = u.slice(0, -1 * TIMELINE_STATUSES_COUNT)
    setUnreadDirectMessages(() => remains)
    setFirstItemIndex(() => firstItemIndex - u.length)
    setDirectMessages(() => [...u, ...directMessages])
    return false
  }, [firstItemIndex, directMessages, setDirectMessages, unreadDirectMessages])

  const timelineClass = () => {
    if (router.query.detail) {
      return 'timeline-with-drawer'
    }
    return 'timeline'
  }

  const backToTop = () => {
    scrollerRef.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="flex timeline-wrapper">
      <section className={`h-full ${timelineClass()}`}>
        <div className="w-full theme-bg theme-text-primary p-2 flex justify-between">
          <div className="text-lg font-bold cursor-pointer" onClick={() => backToTop()}>
            <FormattedMessage id="timeline.direct_messages" />
          </div>
          <div className="w-64 text-xs text-right">
            <button className="text-gray-400 text-base py-1 px-2" title={formatMessage({ id: 'timeline.reload' })} onClick={reload}>
              <FaRotateRight />
            </button>
          </div>
        </div>
        <div className="timeline overflow-y-auto w-full overflow-x-hidden" style={{ height: 'calc(100% - 44px)' }}>
          {directMessages.length > 0 ? (
            <Virtuoso
              style={{ height: '100%' }}
              scrollerRef={ref => {
                scrollerRef.current = ref as HTMLElement
              }}
              firstItemIndex={firstItemIndex}
              atTopStateChange={prependUnreads}
              className="timeline-scrollable"
              data={directMessages}
              endReached={loadMore}
              itemContent={(_, status) => (
                <Conversation
                  client={props.client}
                  account={props.account}
                  status={status}
                  onRefresh={updateStatus}
                  key={status.id}
                  openMedia={props.openMedia}
                  filters={filters}
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
      <Detail client={props.client} account={props.account} className="detail" openMedia={props.openMedia} />
    </div>
  )
}