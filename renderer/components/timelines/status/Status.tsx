import { Avatar } from 'flowbite-react'
import { Entity, MegalodonInterface } from 'megalodon'
import dayjs from 'dayjs'
import Body from './Body'
import Media from './Media'
import emojify from '@/utils/emojify'
import Card from './Card'
import Poll from './Poll'
import { FormattedMessage } from 'react-intl'
import Actions from './Actions'
import { useRouter } from 'next/router'
import { MouseEventHandler, useState } from 'react'
import { findLink } from '@/utils/statusParser'

type Props = {
  status: Entity.Status
  client: MegalodonInterface
  onRefresh: (status: Entity.Status) => void
  openMedia: (media: Entity.Attachment) => void
}

export default function Status(props: Props) {
  const status = originalStatus(props.status)
  const [spoilered, setSpoilered] = useState(status.spoiler_text.length > 0)
  const router = useRouter()

  const onRefresh = async () => {
    const res = await props.client.getStatus(status.id)
    props.onRefresh(res.data)
  }

  const openStatus = () => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, status_id: status.id, detail: true } })
  }

  const openUser = (id: string) => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, user_id: id, detail: true } })
  }

  const statusClicked: MouseEventHandler<HTMLDivElement> = async e => {
    const url = findLink(e.target as HTMLElement, 'status-body')
    if (url) {
      global.ipc.invoke('open-browser', url)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <div className="border-b mr-2 py-1">
      {rebloggedHeader(props.status)}
      <div className="flex">
        <div className="p-2 cursor-pointer" style={{ width: '56px' }}>
          <Avatar img={status.account.avatar} onClick={() => openUser(status.account.id)} />
        </div>
        <div className="text-gray-950 break-all overflow-hidden" style={{ width: 'calc(100% - 56px)' }}>
          <div className="flex justify-between">
            <div className="flex cursor-pointer" onClick={() => openUser(status.account.id)}>
              <span
                className="text-gray-950 text-ellipsis break-all overflow-hidden"
                dangerouslySetInnerHTML={{ __html: emojify(status.account.display_name, status.account.emojis) }}
              ></span>
              <span className="text-gray-600 text-ellipsis break-all overflow-hidden">@{status.account.acct}</span>
            </div>
            <div className="text-gray-600 text-right cursor-pointer" onClick={openStatus}>
              <time dateTime={status.created_at}>{dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}</time>
            </div>
          </div>
          <div className="status-body">
            <Body status={status} spoilered={spoilered} setSpoilered={setSpoilered} onClick={statusClicked} />
          </div>
          {!spoilered && (
            <>
              {status.poll && <Poll poll={status.poll} onRefresh={onRefresh} client={props.client} />}
              {status.card && <Card card={status.card} />}
              <Media media={status.media_attachments} sensitive={status.sensitive} openMedia={props.openMedia} />
            </>
          )}

          <Actions status={status} client={props.client} onRefresh={onRefresh} />
        </div>
      </div>
    </div>
  )
}

const originalStatus = (status: Entity.Status) => {
  if (status.reblog && !status.quote) {
    return status.reblog
  } else {
    return status
  }
}

const rebloggedHeader = (status: Entity.Status) => {
  if (status.reblog && !status.quote) {
    return (
      <div className="flex text-gray-600">
        <div className="grid justify-items-end pr-2" style={{ width: '56px' }}>
          <Avatar img={status.account.avatar} size="xs" />
        </div>
        <div style={{ width: 'calc(100% - 56px)' }}>
          <FormattedMessage id="timeline.status.boosted" values={{ user: status.account.username }} />
        </div>
      </div>
    )
  } else {
    return null
  }
}
