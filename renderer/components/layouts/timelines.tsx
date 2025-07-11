import { Account, db } from '@/db'
import { Card, Chip, List, ListItem, ListItemPrefix, ListItemSuffix } from '@material-tailwind/react'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { FaBell, FaBookmark, FaGlobe, FaHouse, FaList, FaStar, FaUsers, FaHashtag, FaUserPlus, FaEnvelope } from 'react-icons/fa6'
import { useIntl } from 'react-intl'
import Jump from '../Jump'
import { useUnreads } from '@/provider/unreads'

type Context = {
  reloadMenu: () => Promise<void>
}

const TimelinesContext = createContext<Context>({
  reloadMenu: async () => {}
})

TimelinesContext.displayName = 'TimelinesContext'

export const useTimelines = () => {
  return useContext(TimelinesContext)
}

type LayoutProps = {
  children: React.ReactNode
}

export type Timeline = {
  id: string
  title: string
  icon: JSX.Element
  path: string
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const { formatMessage } = useIntl()
  const { unreads, setUnreads } = useUnreads()

  const [account, setAccount] = useState<Account | null>(null)
  const [lists, setLists] = useState<Array<Entity.List>>([])
  const [followedTags, setFollowedTags] = useState<Array<Entity.Tag>>([])
  const [openJump, setOpenJump] = useState(false)
  const [client, setClient] = useState<MegalodonInterface>()
  const [followRequests, setFollowRequests] = useState<Array<Timeline>>([])

  useHotkeys('mod+k', () => setOpenJump(current => !current))

  useEffect(() => {
    if (router.query.id) {
      const f = async () => {
        const acct = await db.accounts.get(parseInt(router.query.id as string))
        if (!acct) return
        setAccount(acct)
      }
      f()
    }
  }, [router.query.id])

  useEffect(() => {
    if (!account) return
    const c = generator(account.sns, account.url, account.access_token, 'Whalebird')
    setClient(c)
    const f = async () => {
      const res = await c.getLists()
      setLists(
        res.data.sort((a, b) => {
          if (a.title > b.title) {
            return 1
          } else {
            return -1
          }
        })
      )
    }
    f()
    const g = async () => {
      try {
        const res = await c.getFollowedTags()
        setFollowedTags(res.data)
      } catch (err) {
        setFollowedTags([])
        console.error(err)
      }
    }
    g()
    const r = async () => {
      const res = await c.getFollowRequests()
      if (res.data.length > 0) {
        setUnreads(current =>
          Object.assign({}, current, {
            [`${account.id?.toString()}_follow_requests`]: res.data.length
          })
        )
        console.log(unreads)
        setFollowRequests([
          {
            id: 'follow_requests',
            title: formatMessage({ id: 'timeline.follow_requests' }),
            icon: <FaUserPlus />,
            path: `/accounts/${router.query.id}/follow_requests`
          }
        ])
      } else {
        setFollowRequests([])
      }
    }
    r()
  }, [account])

  const pages: Array<Timeline> = [
    {
      id: 'home',
      title: formatMessage({ id: 'timeline.home' }),
      icon: <FaHouse />,
      path: `/accounts/${router.query.id}/home`
    },
    {
      id: 'notifications',
      title: formatMessage({ id: 'timeline.notifications' }),
      icon: <FaBell />,
      path: `/accounts/${router.query.id}/notifications`
    },
    {
      id: 'direct_messages',
      title: formatMessage({ id: 'timeline.direct_messages' }),
      icon: <FaEnvelope />,
      path: `/accounts/${router.query.id}/direct_messages`
    },
    {
      id: 'local',
      title: formatMessage({ id: 'timeline.local' }),
      icon: <FaUsers />,
      path: `/accounts/${router.query.id}/local`
    },
    {
      id: 'public',
      title: formatMessage({ id: 'timeline.public' }),
      icon: <FaGlobe />,
      path: `/accounts/${router.query.id}/public`
    },
    {
      id: 'favourites',
      title: formatMessage({ id: 'timeline.favourites' }),
      icon: <FaStar />,
      path: `/accounts/${router.query.id}/favourites`
    },
    {
      id: 'bookmarks',
      title: formatMessage({ id: 'timeline.bookmarks' }),
      icon: <FaBookmark />,
      path: `/accounts/${router.query.id}/bookmarks`
    }
  ]

  const reloadMenu = async () => {
    const res = await client.getFollowedTags()
    setFollowedTags(res.data)
  }

  return (
    <section className="flex h-screen w-full overflow-hidden">
      <Jump opened={openJump} close={() => setOpenJump(false)} timelines={pages} />
      <Card className="theme-text-primary sidebar w-64 theme-bg rounded-none timeline-scrollable overflow-y-hidden">
        <div className="max-w-full pl-4 mt-2 mb-4 my-profile">
          <p>{account?.username}</p>
          <p>@{account?.domain}</p>
        </div>
        <List className="min-w-[64px]">
          {pages.concat(followRequests).map(page => (
            <ListItem
              key={page.id}
              selected={router.asPath.includes(page.path)}
              onClick={() => router.push(page.path)}
              className="sidebar-menu-item theme-text-primary overflow-hidden whitespace-nowrap"
              title={page.title}
            >
              <ListItemPrefix>{page.icon}</ListItemPrefix>
              <span className="sidebar-menu text-ellipsis whitespace-nowrap overflow-hidden">{page.title}</span>
              {(page.id === 'notifications' && unreads[account?.id?.toString()]) ||
              (page.id === 'follow_requests' && unreads[`${account.id.toString()}_follow_requests`]) ? (
                <ListItemSuffix className="sidebar-toolchip">
                  <Chip
                    value={unreads[account.id.toString()] || unreads[`${account.id.toString()}_follow_requests`]}
                    variant="ghost"
                    size="sm"
                    className="rounded-full theme-text-primary theme-badge"
                  />
                </ListItemSuffix>
              ) : null}
            </ListItem>
          ))}
          {lists.map(list => (
            <ListItem
              key={list.id}
              selected={router.asPath.includes(`list_${list.id}`)}
              onClick={() => router.push({ pathname: `/accounts/${router.query.id}/list_${list.id}` })}
              className="sidebar-menu-item theme-text-primary overflow-hidden whitespace-nowrap"
              title={list.title}
            >
              <ListItemPrefix>
                <FaList />
              </ListItemPrefix>
              <div className="sidebar-menu text-ellipsis whitespace-nowrap overflow-hidden">{list.title}</div>
            </ListItem>
          ))}

          {followedTags.map(tag => (
            <ListItem
              key={tag.name}
              selected={router.asPath.includes(`tag_${tag.name}`)}
              onClick={() => router.push({ pathname: `/accounts/${router.query.id}/tag_${tag.name}` })}
              className="sidebar-menu-item theme-text-primary overflow-hidden whitespace-nowrap"
              title={tag.name}
            >
              <ListItemPrefix>
                <FaHashtag />
              </ListItemPrefix>
              <div className="sidebar-menu text-ellipsis whitespace-nowrap overflow-hidden">{tag.name}</div>
            </ListItem>
          ))}
        </List>
      </Card>
      <TimelinesContext.Provider value={{ reloadMenu }}>{children}</TimelinesContext.Provider>
    </section>
  )
}
