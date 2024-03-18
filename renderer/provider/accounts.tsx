import { Account } from '@/db'
import generateNotification from '@/utils/notification'
import { unreadCount } from '@/entities/marker'
import generator, { Entity, MegalodonInterface, WebSocketInterface } from 'megalodon'
import { createContext, useContext, useRef, useState } from 'react'
import { useUnreads } from './unreads'
import { useIntl } from 'react-intl'

type Context = {
  addAccount: (account: Account) => void
  removeAccount: (account: Account) => void
  removeAll: () => void
}

const AccountsContext = createContext<Context>({
  addAccount: (_: Account) => {},
  removeAccount: (_: Account) => {},
  removeAll: () => {}
})

AccountsContext.displayName = 'AccountsContext'

export const useAccounts = () => {
  return useContext(AccountsContext)
}

type Props = {
  children: React.ReactNode
}

export const AccountsProvider: React.FC<Props> = ({ children }) => {
  const [_accounts, setAccounts] = useState<Array<Account>>([])
  const streamings = useRef<{ [key: string]: WebSocketInterface }>({})
  const { setUnreads } = useUnreads()
  const { formatMessage } = useIntl()

  const addAccount = (account: Account) => {
    setAccounts(current => [...current, account])
    startStreaming(account)
  }

  const removeAccount = (account: Account) => {
    setAccounts(current => current.filter(a => a.id !== account.id))
    if (streamings.current[account.id]) {
      streamings.current[account.id].removeAllListeners()
      streamings.current[account.id].stop()
      console.log(`close user streaming for ${account.domain}`)
    }
  }

  const removeAll = () => {
    setAccounts([])
    Object.keys(streamings.current).map(key => {
      streamings.current[key].removeAllListeners()
      streamings.current[key].stop()
    })
    console.log('close all user streamings')
    streamings.current = {}
  }

  const startStreaming = async (account: Account) => {
    if (!account.id) return
    // Start user streaming for notification
    const client = generator(account.sns, account.url, account.access_token, 'Whalebird')
    const notifications = (await client.getNotifications()).data
    try {
      const res = await client.getMarkers(['notifications'])
      const marker = res.data as Entity.Marker
      if (marker.notifications) {
        const count = unreadCount(marker.notifications, notifications)
        setUnreads(current =>
          Object.assign({}, current, {
            [account.id?.toString()]: count
          })
        )
      }
    } catch (err) {
      console.error(err)
    }

    const socket = await client.userStreaming()
    streamings.current = Object.assign({}, streamings.current, {
      [account.id]: socket
    })
    socket.on('connect', () => {
      console.log(`connect to user streaming for ${account.domain}`)
    })
    socket.on('notification', (notification: Entity.Notification) => {
      const [title, body] = generateNotification(notification, formatMessage)
      if (title.length > 0) {
        new window.Notification(title, { body: body })
      }
      updateUnreads(account, client)
    })
  }

  const updateUnreads = async (account: Account, client: MegalodonInterface) => {
    try {
      const res = await client.getMarkers(['notifications'])
      const marker = res.data as Entity.Marker
      if (marker.notifications) {
        const notifications = (await client.getNotifications()).data
        const count = unreadCount(marker.notifications, notifications)
        setUnreads(current =>
          Object.assign({}, current, {
            [account.id?.toString()]: count
          })
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  return <AccountsContext.Provider value={{ addAccount, removeAccount, removeAll }}>{children}</AccountsContext.Provider>
}
