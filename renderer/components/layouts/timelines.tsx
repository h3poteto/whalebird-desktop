import { Account, db } from '@/db'
import { CustomFlowbiteTheme, Flowbite, Sidebar } from 'flowbite-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

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
      active: 'bg-blue-400 text-gray-800 hover:bg-blue-300'
    }
  }
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()

  const [account, setAccount] = useState<Account | null>(null)
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

  const pages = [
    {
      id: 'home',
      title: 'Home',
      path: `/accounts/${router.query.id}/home`
    },
    {
      id: 'notifications',
      title: 'Notifications',
      path: `/accounts/${router.query.id}/notifications`
    },
    {
      id: 'local',
      title: 'Local',
      path: `/accounts/${router.query.id}/local`
    },
    {
      id: 'public',
      title: 'Public',
      path: `/accounts/${router.query.id}/public`
    }
  ]

  return (
    <section className="flex h-screen w-full">
      <Flowbite theme={{ theme: customTheme }}>
        <Sidebar className="text-blue-200">
          <div className="max-w-full pl-4 mt-2 mb-4">
            <p>{account?.username}</p>
            <p>@{account?.domain}</p>
          </div>
          <Sidebar.Items>
            <Sidebar.ItemGroup>
              {pages.map(page => (
                <Sidebar.Item key={page.id} active={`${page.path}/` === router.asPath} onClick={() => router.push(page.path)}>
                  {page.title}
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
