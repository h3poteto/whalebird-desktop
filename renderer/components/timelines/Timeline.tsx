import { Account } from '@/db'
import { TextInput } from 'flowbite-react'
import { Entity, MegalodonInterface } from 'megalodon'
import { useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import Status from './status/Status'
import { FormattedMessage, useIntl } from 'react-intl'

type Props = {
  timeline: string
  account: Account
  client: MegalodonInterface
}
export default function Timeline(props: Props) {
  const [statuses, setStatuses] = useState<Array<Entity.Status>>([])
  const { formatMessage } = useIntl()

  useEffect(() => {
    const f = async () => {
      const res = await loadTimeline(props.timeline, props.client)
      setStatuses(res)
    }
    f()
  }, [props.timeline, props.client])

  const loadTimeline = async (tl: string, client: MegalodonInterface, maxId?: string): Promise<Array<Entity.Status>> => {
    let options = { limit: 30 }
    if (maxId) {
      options = Object.assign({}, options, { max_id: maxId })
    }
    switch (tl) {
      case 'home': {
        const res = await client.getHomeTimeline(options)
        return res.data
      }
      case 'local': {
        const res = await client.getLocalTimeline(options)
        return res.data
      }
      case 'public': {
        const res = await client.getPublicTimeline(options)
        return res.data
      }
      default: {
        return []
      }
    }
  }

  const updateStatus = (current: Array<Entity.Status>, status: Entity.Status) => {
    const renew = current.map(s => {
      if (s.id === status.id) {
        return status
      } else if (s.reblog && s.reblog.id === status.id) {
        return Object.assign({}, s, { reblog: status })
      } else if (status.reblog && s.id === status.reblog.id) {
        return status.reblog
      } else if (status.reblog && s.reblog && s.reblog.id === status.reblog.id) {
        return Object.assign({}, s, { reblog: status.reblog })
      } else {
        return s
      }
    })
    return renew
  }

  return (
    <section className="h-full w-full">
      <div className="w-full bg-blue-950 text-blue-100 p-2 flex justify-between">
        <div className="text-lg font-bold">
          <FormattedMessage id={`timeline.${props.timeline}`} />
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
          data={statuses}
          itemContent={(_, status) => (
            <Status
              client={props.client}
              status={status}
              key={status.id}
              onRefresh={status => setStatuses(current => updateStatus(current, status))}
            />
          )}
        />
      </div>
    </section>
  )
}
