import { Account, db } from '@/db'
import { Card, Chip, List, ListItem, ListItemPrefix, ListItemSuffix } from '@material-tailwind/react'
import generator, { Entity } from 'megalodon'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { FaBell, FaBookmark, FaGlobe, FaHouse, FaList, FaStar, FaUsers } from 'react-icons/fa6'
import { useIntl } from 'react-intl'
import Jump from '../Jump'
import { useUnreads } from '@/provider/unreads'

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
  const { unreads } = useUnreads()

  const [account, setAccount] = useState<Account | null>(null)
  const [lists, setLists] = useState<Array<Entity.List>>([])
  const [openJump, setOpenJump] = useState(false)

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
    const f = async () => {
      const res = await c.getLists()
      setLists(res.data)
    }
    f()
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

  return (
    <section className="flex h-screen w-full overflow-hidden">
      <Jump opened={openJump} close={() => setOpenJump(false)} timelines={pages} />
      <Card className="theme-text-primary sidebar w-64 theme-bg rounded-none">
        <div className="max-w-full pl-4 mt-2 mb-4 my-profile">
          <p>{account?.username}</p>
          <p>@{account?.domain}</p>
        </div>
        <List className="min-w-[64px]">
          {pages.map(page => (
            <ListItem
              key={page.id}
              selected={router.asPath.includes(page.path)}
              onClick={() => router.push(page.path)}
              className="sidebar-menu-item theme-text-primary overflow-hidden whitespace-nowrap"
              title={page.title}
            >
              <ListItemPrefix>{page.icon}</ListItemPrefix>
              <span className="sidebar-menu text-ellipsis whitespace-nowrap overflow-hidden">{page.title}</span>
              {page.id === 'notifications' && unreads[account?.id?.toString()] ? (
                <ListItemSuffix className="sidebar-toolchip">
                  <Chip
                    value={unreads[account.id.toString()]}
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
        </List>
      </Card>
      {children}
    </section>
  )
}
