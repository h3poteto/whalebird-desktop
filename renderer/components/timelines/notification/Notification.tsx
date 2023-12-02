import { Entity, MegalodonInterface } from 'megalodon'
import Status from '../status/Status'
import Reaction from './Reaction'
import Follow from './Follow'

type Props = {
  notification: Entity.Notification
  client: MegalodonInterface
  onRefresh: (status: Entity.Status) => void
  openMedia: (media: Entity.Attachment) => void
}

export default function Notification(props: Props) {
  switch (props.notification.type) {
    case 'mention': {
      if (props.notification.status) {
        return <Status client={props.client} status={props.notification.status} onRefresh={props.onRefresh} openMedia={props.openMedia} />
      } else {
        return null
      }
    }
    case 'favourite':
    case 'reblog':
    case 'poll_expired':
    case 'poll_vote':
    case 'quote':
    case 'status':
    case 'update':
    case 'emoji_reaction':
    case 'reaction': {
      if (props.notification.status) {
        return <Reaction client={props.client} notification={props.notification} onRefresh={props.onRefresh} openMedia={props.openMedia} />
      } else {
        return null
      }
    }
    case 'follow':
    case 'follow_request':
      return <Follow notification={props.notification} />

    default: {
      return null
    }
  }
}
