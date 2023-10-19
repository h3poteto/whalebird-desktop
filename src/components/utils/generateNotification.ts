import type { Entity } from 'megalodon'
import { convert } from 'html-to-text'

export const generateNotification = (notification: Entity.Notification): [string, string] => {
  if (!notification.account) return ['', '']
  switch (notification.type) {
    case 'follow':
      return ['Follow', `${notification.account.acct} followed you`]
    case 'follow_request':
      return ['Follow Request', `${notification.account.acct} requested to follow you`]
    case 'favourite':
      return ['Favourite', `${notification.account.acct} favourited your post`]
    case 'reblog':
      return ['Boost', `${notification.account.acct} boosted your post`]
    case 'poll_expired':
      return ['Poll', `${notification.account.acct}'s poll is expired`]
    case 'poll_vote':
      return ['Poll', `${notification.account.acct}'s voted your poll`]
    case 'quote':
      return ['Quote', `${notification.account.acct} quoted your post`]
    case 'status':
      return ['Status', `${notification.account.acct} just post`]
    case 'update':
      return ['Update', `${notification.account.acct} updated the post`]
    case 'emoji_reaction':
    case 'reaction':
      return ['Reaction', `${notification.account.acct} reacted your post`]
    case 'move':
      return ['Move', `${notification.account.acct} migrated to`]
    case 'mention':
      return [`${notification.account.acct}`, convert(notification.status!.content, {})]
    default:
      return ['', '']
  }
}
