import { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { Account, db } from '@/db'
import NewAccount from '@/components/accounts/New'
import { Avatar } from 'flowbite-react'
import { useRouter } from 'next/router'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [accounts, setAccounts] = useState<Array<Account>>([])
  const [openNewModal, setOpenNewModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fn = async () => {
      const acct = await db.accounts.toArray()
      setAccounts(acct)
      if (acct.length === 0) {
        setOpenNewModal(true)
      }
    }
    fn()
  }, [])

  const closeNewModal = async () => {
    const acct = await db.accounts.toArray()
    setAccounts(acct)
    setOpenNewModal(false)
  }

  const openAccount = (id: number) => {
    router.push(`/accounts/${id}`)
  }

  const openContextMenu = (id: number) => {}

  return (
    <div className="app flex flex-col min-h-screen">
      <main className="flex w-full box-border my-0 mx-auto min-h-screen">
        <aside className="w-16 bg-gray-900">
          {accounts.map(account => (
            <Avatar
              alt={account.domain}
              img={account.avatar}
              rounded
              key={account.id}
              className="py-2"
              onClick={() => openAccount(account.id)}
              onContextMenu={() => openContextMenu(account.id)}
            />
          ))}
          <button className="py-4 px-6 items-center" onClick={() => setOpenNewModal(true)}>
            <FaPlus className="text-gray-400" />
          </button>
          <NewAccount opened={openNewModal} close={closeNewModal} />
        </aside>
        {children}
      </main>
    </div>
  )
}
