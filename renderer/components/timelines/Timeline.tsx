import { Account } from '@/db'
import generator, { Entity, MegalodonInterface, WebSocketInterface } from 'megalodon'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Virtuoso } from 'react-virtuoso'
import Status from './status/Status'
import { FormattedMessage, useIntl } from 'react-intl'
import Detail from '../detail/Detail'
import { useRouter } from 'next/router'
import Compose from '../compose/Compose'
import { useHotkeys } from 'react-hotkeys-hook'
import { Input, Spinner } from '@material-tailwind/react'
import parse from 'parse-link-header'

const TIMELINE_STATUSES_COUNT = 30
const TIMELINE_MAX_STATUSES = 2147483647

type Props = {
  timeline: string
  account: Account
  client: MegalodonInterface
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}

export default function Timeline(props: Props) {
  const [statuses, setStatuses] = useState<Array<Entity.Status>>([])
  const [unreads, setUnreads] = useState<Array<Entity.Status>>([])
  const [firstItemIndex, setFirstItemIndex] = useState(TIMELINE_MAX_STATUSES)
  const [composeHeight, setComposeHeight] = useState(120)
  const [list, setList] = useState<Entity.List | null>(null)
  const [filters, setFilters] = useState<Array<Entity.Filter>>([])
  const [nextMaxId, setNextMaxId] = useState<string | null>(null)

  const router = useRouter()
  const { formatMessage } = useIntl()
  const scrollerRef = useRef<HTMLElement | null>(null)
  const streaming = useRef<WebSocketInterface | null>(null)
  const composeRef = useRef<HTMLDivElement | null>(null)
  useHotkeys('mod+r', () => reload())

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      entries.forEach(el => {
        setComposeHeight(el.contentRect.height)
      })
    })
    if (composeRef.current) {
      observer.observe(composeRef.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const f = async () => {
      const f = await loadFilter(props.timeline, props.client)
      setFilters(f)
      const res = await loadTimeline(props.timeline, props.client)
      setStatuses(res)
      const instance = await props.client.getInstance()
      const c = generator(props.account.sns, instance.data.urls.streaming_api, props.account.access_token, 'Whalebird')
      setList(null)
      switch (props.timeline) {
        case 'home': {
          streaming.current = c.userSocket()
          break
        }
        case 'local': {
          streaming.current = c.localSocket()
          break
        }
        case 'public': {
          streaming.current = c.publicSocket()
          break
        }
        default: {
          const match = props.timeline.match(/list_(\d+)/)
          if (match && match[1] && typeof match[1] === 'string') {
            const res = await props.client.getList(match[1])
            streaming.current = c.listSocket(match[1])
            setList(res.data)
          }
          break
        }
      }
      if (streaming.current) {
        streaming.current.on('connect', () => {
          console.log(`connected to ${props.timeline}`)
        })
        streaming.current.on('update', (status: Entity.Status) => {
          if (scrollerRef.current && scrollerRef.current.scrollTop > 10) {
            setUnreads(current => [status, ...current])
          } else {
            setStatuses(current => [status, ...current])
          }
        })
      }
    }
    f()

    return () => {
      setUnreads([])
      setFirstItemIndex(TIMELINE_MAX_STATUSES)
      setStatuses([])
      if (streaming.current) {
        streaming.current.removeAllListeners()
        streaming.current.stop()
        streaming.current = null
        console.log(`closed ${props.timeline}`)
      }
    }
  }, [props.timeline, props.client, props.account])

  const loadFilter = async (tl: string, client: MegalodonInterface): Promise<Array<Entity.Filter>> => {
    const res = await client.getFilters()
    let context = 'home'
    switch (tl) {
      case 'home':
        context = 'home'
        break
      case 'local':
      case 'public':
        context = 'public'
        break
      default:
        context = 'home'
        break
    }
    return res.data.filter(f => f.context.includes(context))
  }

  const loadTimeline = async (tl: string, client: MegalodonInterface, maxId?: string): Promise<Array<Entity.Status>> => {
    let options = { limit: 30 }
    if (maxId) {
      options = Object.assign({}, options, { max_id: maxId })
    }
    switch (tl) {
      case 'home': {
        const res = await client.getHomeTimeline(options)
        return res.data
      }
      case 'local': {
        const res = await client.getLocalTimeline(options)
        return res.data
      }
      case 'public': {
        const res = await client.getPublicTimeline(options)
        return res.data
      }
      case 'favourites': {
        const res = await client.getFavourites(options)
        const link = parse(res.headers.link)
        if (link !== null && link.next) {
          setNextMaxId(link.next.max_id)
        }
        return res.data
      }
      case 'bookmarks': {
        const res = await client.getBookmarks(options)
        const link = parse(res.headers.link)
        if (link !== null && link.next) {
          setNextMaxId(link.next.max_id)
        }
        return res.data
      }
      default: {
        // Check list
        const match = tl.match(/list_(\d+)/)
        if (match[1] && typeof match[1] === 'string') {
          const res = await client.getListTimeline(match[1], options)
          return res.data
        }
        return []
      }
    }
  }

  const updateStatus = (current: Array<Entity.Status>, status: Entity.Status) => {
    const renew = current.map(s => {
      if (s.id === status.id) {
        return status
      } else if (s.reblog && s.reblog.id === status.id) {
        return Object.assign({}, s, { reblog: status })
      } else if (status.reblog && s.id === status.reblog.id) {
        return status.reblog
      } else if (status.reblog && s.reblog && s.reblog.id === status.reblog.id) {
        return Object.assign({}, s, { reblog: status.reblog })
      } else {
        return s
      }
    })
    return renew
  }

  const reload = useCallback(async () => {
    const res = await loadTimeline(props.timeline, props.client)
    setStatuses(res)
  }, [props.timeline, props.client, setStatuses])

  const loadMore = useCallback(async () => {
    console.debug('appending')
    let maxId = null
    switch (props.timeline) {
      case 'favourites':
      case 'bookmarks':
        if (!nextMaxId) {
          return
        }
        maxId = nextMaxId
        break
      default:
        maxId = statuses[statuses.length - 1].id
        break
    }

    const append = await loadTimeline(props.timeline, props.client, maxId)
    setStatuses(last => [...last, ...append])
  }, [props.client, statuses, setStatuses, nextMaxId])

  const prependUnreads = useCallback(() => {
    console.debug('prepending')
    const u = unreads.slice().reverse().slice(0, TIMELINE_STATUSES_COUNT).reverse()
    const remains = u.slice(0, -1 * TIMELINE_STATUSES_COUNT)
    setUnreads(() => remains)
    setFirstItemIndex(() => firstItemIndex - u.length)
    setStatuses(() => [...u, ...statuses])
    return false
  }, [firstItemIndex, statuses, setStatuses, unreads])

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
        <div className="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
          <div className="text-lg font-bold cursor-pointer" onClick={() => backToTop()}>
            {props.timeline.match(/list_(\d+)/) ? <>{list && list.title}</> : <FormattedMessage id={`timeline.${props.timeline}`} />}
          </div>
          <div className="w-64 text-xs">
            <form>
              <Input
                type="text"
                label={formatMessage({ id: 'timeline.search' })}
                disabled
                containerProps={{ className: 'h-7' }}
                className="!py-1 !px-2 !text-xs"
                labelProps={{ className: '!leading-10' }}
              />
            </form>
          </div>
        </div>
        <div className="overflow-x-hidden" style={{ height: 'calc(100% - 50px)' }}>
          {statuses.length > 0 ? (
            <Virtuoso
              style={{ height: `calc(100% - ${composeHeight}px)` }}
              scrollerRef={ref => {
                scrollerRef.current = ref as HTMLElement
              }}
              className="timeline-scrollable"
              firstItemIndex={firstItemIndex}
              atTopStateChange={prependUnreads}
              data={statuses}
              endReached={loadMore}
              itemContent={(_, status) => (
                <Status
                  client={props.client}
                  account={props.account}
                  status={status}
                  key={status.id}
                  onRefresh={status => setStatuses(current => updateStatus(current, status))}
                  openMedia={props.openMedia}
                  filters={filters}
                />
              )}
            />
          ) : (
            <div className="w-full pt-6" style={{ height: `calc(100% - ${composeHeight}px)` }}>
              <Spinner className="m-auto" />
            </div>
          )}

          <div ref={composeRef}>
            <Compose client={props.client} />
          </div>
        </div>
      </section>
      <Detail client={props.client} account={props.account} className="detail" openMedia={props.openMedia} />
    </div>
  )
}
