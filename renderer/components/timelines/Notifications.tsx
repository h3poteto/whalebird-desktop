import { Account } from '@/db'
import { TextInput } from 'flowbite-react'
import { Entity, MegalodonInterface } from 'megalodon'
import { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'
import Notification from './notification/Notification'

type Props = {
  account: Account
  client: MegalodonInterface
}

export default function Notifications(props: Props) {
  const { formatMessage } = useIntl()
  const [notifications, setNotifications] = useState<Array<Entity.Notification>>([])

  useEffect(() => {
    const f = async () => {
      const res = await loadNotifications(props.client)
      setNotifications(res)
    }
    f()
  }, [props.client])

  const loadNotifications = async (client: MegalodonInterface, maxId?: string): Promise<Array<Entity.Notification>> => {
    let options = { limit: 30 }
    if (maxId) {
      options = Object.assign({}, options, { max_id: maxId })
    }
    const res = await client.getNotifications(options)
    return res.data
  }

  const updateStatus = (status: Entity.Status) => {
    const renew = notifications.map(n => {
      if (n.status === undefined || n.status === null) {
        return n
      }
      if (n.status.id === status.id) {
        return Object.assign({}, n, { status })
      } else if (n.status.reblog && n.status.reblog.id === status.id) {
        const s = Object.assign({}, n.status, { reblog: status })
        return Object.assign({}, n, { status: s })
      }
      return n
    })
    setNotifications(renew)
  }

  return (
    <section className="h-full w-full">
      <div className="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
        <div className="text-lg font-bold">
          <FormattedMessage id="timeline.notifications" />
        </div>
        <div className="w-64 text-xs">
          <form>
            <TextInput type="text" placeholder={formatMessage({ id: 'timeline.search' })} disabled sizing="sm" />
          </form>
        </div>
      </div>
      <div className="timeline overflow-y-auto w-full overflow-x-hidden" style={{ height: 'calc(100% - 50px)' }}>
        <Virtuoso
          style={{ height: '100%' }}
          data={notifications}
          itemContent={(_, notification) => (
            <Notification client={props.client} notification={notification} onRefresh={updateStatus} key={notification.id} />
          )}
        />
      </div>
    </section>
  )
}
