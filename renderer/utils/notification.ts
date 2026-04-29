import sanitizeHtml from 'sanitize-html'
import { Entity } from 'megalodon'
import { MessageDescriptor } from 'react-intl'

const generateNotification = (
  notification: Entity.Notification,
  formatMessage: (descriptor: MessageDescriptor, values?: any, opts?: any) => string
): [string, string, string | undefined] => {
  const avatar = notification.account.avatar
  switch (notification.type) {
    case 'follow':
      return [
        formatMessage({ id: 'notification.follow.title' }),
        formatMessage({ id: 'notification.follow.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'follow_request':
      return [
        formatMessage({ id: 'notification.follow_request.title' }),
        formatMessage({ id: 'notification.follow_requested.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'favourite':
      return [
        formatMessage({ id: 'notification.favourite.title' }),
        formatMessage({ id: 'notification.favourite.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'reblog':
      return [
        formatMessage({ id: 'notification.reblog.title' }),
        formatMessage({ id: 'notification.reblog.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'poll_expired':
      return [
        formatMessage({ id: 'notification.poll_expired.title' }),
        formatMessage({ id: 'notification.poll_expired.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'poll_vote':
      return [
        formatMessage({ id: 'notification.poll_vote.title' }),
        formatMessage({ id: 'notification.poll_vote.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'quote':
      return [
        formatMessage({ id: 'notification.quote.title' }),
        formatMessage({ id: 'notification.quote.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'status':
      return [
        formatMessage({ id: 'notification.status.title' }),
        formatMessage({ id: 'notification.status.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'update':
      return [
        formatMessage({ id: 'notification.update.title' }),
        formatMessage({ id: 'notification.update.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'emoji_reaction':
    case 'reaction':
      return [
        formatMessage({ id: 'notification.emoji_reaction.title' }),
        formatMessage({ id: 'notification.emoji_reaction.body' }, { user: notification.account.acct }),
        avatar
      ]
    case 'mention':
      return [
        `${notification.account.acct}`,
        sanitizeHtml(notification.status!.content, {
          allowedTags: [],
          allowedAttributes: false
        }),
        avatar
      ]
    default:
      return ['', '', undefined]
  }
}

export default generateNotification
