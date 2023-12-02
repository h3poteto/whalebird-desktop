import { Entity, MegalodonInterface } from 'megalodon'
import { useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import Status from '../timelines/status/Status'

type Props = {
  client: MegalodonInterface
  status_id: string
  openMedia: (media: Entity.Attachment) => void
}

export default function Thread(props: Props) {
  const [ancestors, setAncestors] = useState<Array<Entity.Status>>([])
  const [descendants, setDescendants] = useState<Array<Entity.Status>>([])
  const [status, setStatus] = useState<Entity.Status | null>(null)

  useEffect(() => {
    if (props.status_id) {
      const f = async () => {
        const s = await props.client.getStatus(props.status_id)
        setStatus(s.data)
        const res = await props.client.getStatusContext(props.status_id)
        setAncestors(res.data.ancestors)
        setDescendants(res.data.descendants)
      }
      f()
    }
  }, [props.status_id])

  return (
    <>
      <Virtuoso
        style={{ height: 'calc(100% - 50px)' }}
        data={[...ancestors, status, ...descendants].filter(s => s !== null)}
        itemContent={(_, status) => (
          <Status client={props.client} status={status} key={status.id} onRefresh={() => {}} openMedia={props.openMedia} />
        )}
      />
    </>
  )
}
