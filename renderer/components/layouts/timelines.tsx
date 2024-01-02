import { Account, db } from '@/db'
import { CustomFlowbiteTheme, Flowbite, Sidebar } from 'flowbite-react'
import generator, { Entity } from 'megalodon'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FaBell, FaGlobe, FaHouse, FaList, FaUsers } from 'react-icons/fa6'
import { useIntl } from 'react-intl'

type LayoutProps = {
  children: React.ReactNode
}

const customTheme: CustomFlowbiteTheme = {
  sidebar: {
    root: {
      inner: 'h-full overflow-y-auto overflow-x-hidden bg-blue-950 py-4 px-3 dark:bg-blue-950'
    },
    item: {
      base: 'flex items-center justify-center rounded-lg p-2 text-base font-normal text-blue-200 hover:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-900 cursor-pointer',
      active: 'bg-blue-400 text-gray-800 hover:bg-blue-300',
      icon: {
        base: 'h-5 w-5 flex-shrink-0 text-gray-500 transition duration-75 text-blue-200 group-hover:text-blue-900 dark:text-blue-200 dark:group-hover:text-blue-900',
        active: 'text-gray-800'
      }
    }
  }
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const { formatMessage } = useIntl()

  const [account, setAccount] = useState<Account | null>(null)
  const [lists, setLists] = useState<Array<Entity.List>>([])

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

  const pages = [
    {
      id: 'home',
      title: formatMessage({ id: 'timeline.home' }),
      icon: FaHouse,
      path: `/accounts/${router.query.id}/home`
    },
    {
      id: 'notifications',
      title: formatMessage({ id: 'timeline.notifications' }),
      icon: FaBell,
      path: `/accounts/${router.query.id}/notifications`
    },
    {
      id: 'local',
      title: formatMessage({ id: 'timeline.local' }),
      icon: FaUsers,
      path: `/accounts/${router.query.id}/local`
    },
    {
      id: 'public',
      title: formatMessage({ id: 'timeline.public' }),
      icon: FaGlobe,
      path: `/accounts/${router.query.id}/public`
    }
  ]

  return (
    <section className="flex h-screen w-full overflow-hidden">
      <Flowbite theme={{ theme: customTheme }}>
        <Sidebar className="text-blue-200 sidebar">
          <div className="max-w-full pl-4 mt-2 mb-4 my-profile">
            <p>{account?.username}</p>
            <p>@{account?.domain}</p>
          </div>
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              {pages.map(page => (
                <Sidebar.Item
                  key={page.id}
                  active={router.asPath.includes(page.path)}
                  onClick={() => router.push(page.path)}
                  icon={page.icon}
                  className="sidebar-menu-item"
                >
                  <span className="sidebar-menu">{page.title}</span>
                </Sidebar.Item>
              ))}
              {lists.map(list => (
                <Sidebar.Item
                  key={list.id}
                  active={router.asPath.includes(`list_${list.id}`)}
                  onClick={() => router.push({ pathname: `/accounts/${router.query.id}/list_${list.id}` })}
                  icon={FaList}
                  className="sidebar-menu-item"
                >
                  <span className="sidebar-menu">{list.title}</span>
                </Sidebar.Item>
              ))}
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      </Flowbite>
      {children}
    </section>
  )
}
