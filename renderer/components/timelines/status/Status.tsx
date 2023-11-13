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

type Props = {
  status: Entity.Status
  client: MegalodonInterface
  onRefresh: (status: Entity.Status) => void
}

export default function Status(props: Props) {
  const status = originalStatus(props.status)

  const onRefresh = async () => {
    const res = await props.client.getStatus(status.id)
    props.onRefresh(res.data)
  }

  return (
    <div className="border-b mr-2 py-1">
      {rebloggedHeader(props.status)}
      <div className="flex">
        <div className="p-2" style={{ width: '56px' }}>
          <Avatar img={status.account.avatar} />
        </div>
        <div className="text-gray-950 break-all overflow-hidden" style={{ width: 'calc(100% - 56px)' }}>
          <div className="flex justify-between">
            <div className="flex">
              <span
                className="text-gray-950 text-ellipsis break-all overflow-hidden"
                dangerouslySetInnerHTML={{ __html: emojify(status.account.display_name, status.account.emojis) }}
              ></span>
              <span className="text-gray-600 text-ellipsis break-all overflow-hidden">@{status.account.acct}</span>
            </div>
            <div className="text-gray-600 text-right">
              <time dateTime={status.created_at}>{dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}</time>
            </div>
          </div>
          <Body status={status} />
          {status.poll && <Poll poll={status.poll} onRefresh={onRefresh} client={props.client} />}
          {status.card && <Card card={status.card} />}
          <Media media={status.media_attachments} />
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
