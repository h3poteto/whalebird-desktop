import { Avatar } from 'flowbite-react'
import { Entity, MegalodonInterface } from 'megalodon'
import dayjs from 'dayjs'
import emojify from '@/utils/emojify'
import Body from '../status/Body'
import Poll from '../status/Poll'
import Card from '../status/Card'
import Media from '../status/Media'
import { FaBarsProgress, FaHouse, FaPenToSquare, FaRetweet, FaStar } from 'react-icons/fa6'
import { useIntl } from 'react-intl'

type Props = {
  notification: Entity.Notification
  client: MegalodonInterface
  onRefresh: (status: Entity.Status) => void
}

export default function Reaction(props: Props) {
  const status = props.notification.status
  const { formatMessage } = useIntl()

  const refresh = async () => {
    const res = await props.client.getStatus(status.id)
    props.onRefresh(res.data)
  }

  return (
    <div className="border-b mr-2 py-1">
      <div className="flex items-center">
        <div style={{ width: '56px' }}>{actionIcon(props.notification)}</div>
        <div style={{ width: 'calc(100% - 56px)' }}>
          <span
            dangerouslySetInnerHTML={{
              __html: emojify(
                formatMessage(
                  {
                    id: actionId(props.notification)
                  },
                  { user: props.notification.account.username }
                ),
                props.notification.account.emojis
              )
            }}
          />
        </div>
      </div>
      <div className="flex">
        <div className="p-2" style={{ width: '56px' }}>
          <Avatar img={status.account.avatar} />
        </div>
        <div className="text-gray-600 break-all overflow-hidden" style={{ width: 'calc(100% - 56px)' }}>
          <div className="flex justify-between">
            <div className="flex">
              <span
                className="text-gray-600 text-ellipsis break-all overflow-hidden"
                dangerouslySetInnerHTML={{ __html: emojify(status.account.display_name, status.account.emojis) }}
              ></span>
              <span className="text-gray-600 text-ellipsis break-all overflow-hidden">@{status.account.acct}</span>
            </div>
            <div className="text-gray-600 text-right">
              <time dateTime={status.created_at}>{dayjs(status.created_at).format('YYYY-MM-DD HH:mm:ss')}</time>
            </div>
          </div>
          <Body status={status} className="text-gray-600" />
          {status.poll && <Poll poll={status.poll} onRefresh={refresh} client={props.client} className="text-gray-600" />}
          {status.card && <Card card={status.card} />}
          <Media media={status.media_attachments} />
        </div>
      </div>
    </div>
  )
}

const actionIcon = (notification: Entity.Notification) => {
  switch (notification.type) {
    case 'favourite': {
      return <FaStar className="text-orange-500 w-4 mr-2 ml-auto" />
    }
    case 'reblog':
    case 'quote': {
      return <FaRetweet className="text-blue-600 w-4 mr-2 ml-auto" />
    }
    case 'poll_expired':
    case 'poll_vote': {
      return <FaBarsProgress className="text-blue-600 w-4 mr-2 ml-auto" />
    }
    case 'status': {
      return <FaHouse className="text-blue-600 w-4 mr-2 ml-auto" />
    }
    case 'update': {
      return <FaPenToSquare className="text-blue-600 w-4 mr-2 ml-auto" />
    }
    case 'emoji_reaction': {
      return <span dangerouslySetInnerHTML={{ __html: notification.emoji }} />
    }
    default:
      return null
  }
}

const actionId = (notification: Entity.Notification) => {
  switch (notification.type) {
    case 'favourite':
      return 'notification.favourite.body'
    case 'reblog':
      return 'notification.reblog.body'
    case 'quote':
      return 'notification.quote.body'
    case 'poll_expired':
      return 'notification.poll_expired.body'
    case 'poll_vote':
      return 'notification.poll.vote'
    case 'status':
      return 'notification.status.body'
    case 'update':
      return 'notification.update.body'
    case 'emoji_reqction':
      return 'notification.emoji_reaction.body'

    default:
      return ''
  }
}
