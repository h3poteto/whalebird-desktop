import { useEffect, useState } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { Account, db } from '@/db'
import NewAccount from '@/components/accounts/New'
import { Avatar, Dropdown } from 'flowbite-react'
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
    if (acct.length === 0) {
      setOpenNewModal(true)
    } else if (!router.query.id) {
      router.push(`/accounts/${acct[0].id}`)
    }
  }

  const openAccount = (id: number) => {
    router.push(`/accounts/${id}`)
  }

  const openContextMenu = (id: number) => {
    document.getElementById(`${id}`).click()
  }

  const dropdownTrigger = (accountId: number) => <span id={`${accountId}`} className="" />

  const removeAccount = async (id: number) => {
    await db.accounts.delete(id)
    const acct = await db.accounts.toArray()
    setAccounts(acct)
    if (acct.length === 0) {
      router.push('/')
      setOpenNewModal(true)
    }
  }

  return (
    <div className="app flex flex-col min-h-screen">
      <main className="flex w-full box-border my-0 mx-auto min-h-screen">
        <aside className="w-16 bg-gray-900">
          {accounts.map(account => (
            <div key={account.id}>
              <Avatar
                alt={account.domain}
                img={account.avatar}
                rounded
                key={account.id}
                className="py-2"
                onClick={() => openAccount(account.id)}
                onContextMenu={() => openContextMenu(account.id)}
              />
              <Dropdown label="" dismissOnClick={true} renderTrigger={() => dropdownTrigger(account.id)}>
                <Dropdown.Item onClick={() => removeAccount(account.id)}>Remove</Dropdown.Item>
              </Dropdown>
            </div>
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
