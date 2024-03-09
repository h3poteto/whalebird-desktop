import { Account } from '@/db'
import { Entity, MegalodonInterface } from 'megalodon'
import { useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import Status from '../timelines/status/Status'

type Props = {
  client: MegalodonInterface
  account: Account
  tag: string
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}

export default function Tag(props: Props) {
  const [statuses, setStatuses] = useState<Array<Entity.Status>>([])

  useEffect(() => {
    if (props.client && props.tag) {
      const f = async () => {
        const res = await props.client.getTagTimeline(props.tag)
        setStatuses(res.data)
      }
      f()
    }
  }, [props.client, props.tag])

  return (
    <div className="overflow-x-hidden" style={{ height: 'calc(100% - 50px)' }}>
      <Virtuoso
        style={{ height: '100%' }}
        data={statuses}
        className="timeline-scrollable"
        itemContent={(_, status) => (
          <Status
            client={props.client}
            account={props.account}
            status={status}
            key={status.id}
            onRefresh={() => {}}
            openMedia={props.openMedia}
            filters={[]}
          />
        )}
      />
    </div>
  )
}
