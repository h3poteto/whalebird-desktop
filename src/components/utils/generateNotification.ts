import type { Entity } from 'megalodon'
import { convert } from 'html-to-text'

export const generateNotification = (notification: Entity.Notification, t: Function): [string, string] => {
  if (!notification.account) return ['', '']
  switch (notification.type) {
    case 'follow':
      return ['Follow', t('notifications.follow', { values: { user: notification.account.acct } })]
    case 'follow_request':
      return ['Follow Request', t('notifications.follow_request', { values: { user: notification.account.acct } })]
    case 'favourite':
      return ['Favourite', t('notifications.favourite', { values: { user: notification.account.acct } })]
    case 'reblog':
      return ['Boost', t('notifications.reblog', { values: { user: notification.account.acct } })]
    case 'poll_expired':
      return ['Poll', t('notifications.poll_expired', { values: { user: notification.account.acct } })]
    case 'poll_vote':
      return ['Poll', t('notifications.poll_vote', { values: { user: notification.account.acct } })]
    case 'quote':
      return ['Quote', t('notifications.quote', { values: { user: notification.account.acct } })]
    case 'status':
      return ['Status', t('notifications.status', { values: { user: notification.account.acct } })]
    case 'update':
      return ['Update', t('notifications.update', { values: { user: notification.account.acct } })]
    case 'emoji_reaction':
    case 'reaction':
      return ['Reaction', t('notifications.reaction', { values: { user: notification.account.acct } })]
    case 'move':
      return ['Move', t('notifications.move', { values: { user: notification.account.acct } })]
    case 'mention':
      return [`${notification.account.acct}`, convert(notification.status!.content, {})]
    default:
      return ['', '']
  }
}
