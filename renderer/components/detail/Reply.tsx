import { MegalodonInterface, Entity } from 'megalodon'
import { useEffect, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import Status from '../timelines/status/Status'
import Compose from '../compose/Compose'
import { Account } from '@/db'

type Props = {
  client: MegalodonInterface
  account: Account
  status_id: string
  openMedia: (media: Entity.Attachment) => void
}

export default function Reply(props: Props) {
  const [ancestors, setAncestors] = useState<Array<Entity.Status>>([])
  const [status, setStatus] = useState<Entity.Status | null>(null)
  const [composeHeight, setComposeHeight] = useState(120)

  const composeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      entries.forEach(el => {
        setComposeHeight(el.contentRect.height)
      })
    })
    if (composeRef.current) {
      observer.observe(composeRef.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (props.status_id) {
      const f = async () => {
        const s = await props.client.getStatus(props.status_id)
        setStatus(s.data)
        const res = await props.client.getStatusContext(props.status_id)
        setAncestors(res.data.ancestors)
      }
      f()
    }
  }, [props.status_id])

  return (
    <div className="overflow-x-hidden" style={{ height: 'calc(100% - 50px)' }}>
      <Virtuoso
        style={{ height: `calc(100% - ${composeHeight}px)` }}
        data={[...ancestors, status].filter(s => s !== null)}
        itemContent={(_, status) => (
          <Status
            client={props.client}
            account={props.account}
            status={status}
            key={status.id}
            onRefresh={() => {}}
            openMedia={props.openMedia}
          />
        )}
      />
      <div ref={composeRef}>
        <Compose client={props.client} in_reply_to={status} />
      </div>
    </div>
  )
}
