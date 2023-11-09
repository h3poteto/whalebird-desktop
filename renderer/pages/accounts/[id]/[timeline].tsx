import { useRouter } from 'next/router'
import Timeline from '@/components/timelines/Timeline'
import { useEffect, useRef, useState } from 'react'
import { Account, db } from '@/db'
import generator, { Entity, MegalodonInterface, WebSocketInterface } from 'megalodon'
import Notifications from '@/components/timelines/Notifications'
import generateNotification from '@/utils/notification'
import { useIntl } from 'react-intl'

export default function Page() {
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [client, setClient] = useState<MegalodonInterface>(null)
  const streaming = useRef<WebSocketInterface | null>(null)
  const { formatMessage } = useIntl()

  useEffect(() => {
    if (router.query.id) {
      const f = async () => {
        const a = await db.accounts.get(parseInt(router.query.id as string))
        if (a) {
          setAccount(a)
          const c = generator(a.sns, a.url, a.access_token, 'Whalebird')
          setClient(c)

          // Start user streaming for notification
          const instance = await c.getInstance()
          const ws = generator(a.sns, instance.data.urls.streaming_api, a.access_token, 'Whalebird')
          streaming.current = ws.userSocket()
          streaming.current.on('connect', () => {
            console.log('connect to user streaming')
          })
          streaming.current.on('notification', (notification: Entity.Notification) => {
            const [title, body] = generateNotification(notification, formatMessage)
            if (title.length > 0) {
              new window.Notification(title, { body: body })
            }
          })
        }
      }
      f()
    }

    return () => {
      if (streaming.current) {
        streaming.current.removeAllListeners()
        streaming.current.stop()
        streaming.current = null
        console.log('close user streaming')
      }
    }
  }, [router.query.id])

  if (!account || !client) return null
  switch (router.query.timeline as string) {
    case 'notifications': {
      return <Notifications account={account} client={client} />
    }
    default: {
      return <Timeline timeline={router.query.timeline as string} account={account} client={client} />
    }
  }
}
