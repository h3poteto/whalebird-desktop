import { useEffect, useRef, useState } from 'react'
import { FaGear, FaPlus } from 'react-icons/fa6'
import { Account, db } from '@/db'
import NewAccount from '@/components/accounts/New'
import Settings from '@/components/Settings'
import { Avatar, Dropdown } from 'flowbite-react'
import { useRouter } from 'next/router'
import { FormattedMessage, useIntl } from 'react-intl'
import generateNotification from '@/utils/notification'
import generator, { Entity, WebSocketInterface } from 'megalodon'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [accounts, setAccounts] = useState<Array<Account>>([])
  const [openNewModal, setOpenNewModal] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const router = useRouter()
  const { formatMessage } = useIntl()
  const streamings = useRef<Array<WebSocketInterface>>([])

  useEffect(() => {
    const fn = async () => {
      const acct = await db.accounts.toArray()
      setAccounts(acct)
      if (acct.length === 0) {
        setOpenNewModal(true)
      }
      acct.forEach(async account => {
        // Start user streaming for notification
        const client = generator(account.sns, account.url, account.access_token, 'Whalebird')
        const instance = await client.getInstance()
        const ws = generator(account.sns, instance.data.urls.streaming_api, account.access_token, 'Whalebird')
        const socket = ws.userSocket()
        streamings.current = [...streamings.current, socket]
        socket.on('connect', () => {
          console.log(`connect to user streaming for ${account.domain}`)
        })
        socket.on('notification', (notification: Entity.Notification) => {
          const [title, body] = generateNotification(notification, formatMessage)
          if (title.length > 0) {
            new window.Notification(title, { body: body })
          }
        })
      })
    }
    fn()

    return () => {
      streamings.current.forEach(streaming => {
        streaming.removeAllListeners()
        streaming.stop()
      })
      streamings.current = []
      console.log('close user streamings')
    }
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

  const selectedClassName = (id: number) => {
    if (id === parseInt(router.query.id as string)) {
      return 'bg-blue-950 cursor-pointer'
    } else {
      return 'cursor-pointer'
    }
  }

  return (
    <div className="app flex flex-col min-h-screen">
      <main className="flex w-full box-border my-0 mx-auto min-h-screen">
        <aside className="w-16 bg-gray-900 flex flex-col justify-between">
          <div>
            {accounts.map(account => (
              <div key={account.id} className={selectedClassName(account.id)}>
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
                  <Dropdown.Item onClick={() => removeAccount(account.id)}>
                    <FormattedMessage id="accounts.remove" />
                  </Dropdown.Item>
                </Dropdown>
              </div>
            ))}
            <button className="py-4 px-6 items-center" onClick={() => setOpenNewModal(true)}>
              <FaPlus className="text-gray-400" />
            </button>
            <NewAccount opened={openNewModal} close={closeNewModal} />
          </div>
          <div className="settings text-gray-400 py-4 px-6 items-center">
            <div className="relative">
              <Dropdown
                label=""
                dismissOnClick
                renderTrigger={() => (
                  <span>
                    <FaGear />
                  </span>
                )}
                placement="right-start"
              >
                <Dropdown.Item onClick={() => setOpenSettings(true)}>
                  <FormattedMessage id="settings.title" />{' '}
                </Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </aside>
        {children}
        <Settings opened={openSettings} close={() => setOpenSettings(false)} />
      </main>
    </div>
  )
}
