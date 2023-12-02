import sanitizeHtml from 'sanitize-html'
import { Entity } from 'megalodon'
import { MessageDescriptor } from 'react-intl'

const generateNotification = (
  notification: Entity.Notification,
  formatMessage: (descriptor: MessageDescriptor, values?: any, opts?: any) => string
): [string, string] => {
  switch (notification.type) {
    case 'follow':
      return [
        formatMessage({ id: 'notification.follow.title' }),
        formatMessage({ id: 'notification.follow.body' }, { user: notification.account.acct })
      ]
    case 'follow_request':
      return [
        formatMessage({ id: 'notification.follow_request.title' }),
        formatMessage({ id: 'notification.follow_requested.body' }, { user: notification.account.acct })
      ]
    case 'favourite':
      return [
        formatMessage({ id: 'notification.favourite.title' }),
        formatMessage({ id: 'notification.favourite.body' }, { user: notification.account.acct })
      ]
    case 'reblog':
      return [
        formatMessage({ id: 'notification.reblog.title' }),
        formatMessage({ id: 'notification.reblog.body' }, { user: notification.account.acct })
      ]
    case 'poll_expired':
      return [
        formatMessage({ id: 'notification.poll_expired.title' }),
        formatMessage({ id: 'notification.poll_expired.body' }, { user: notification.account.acct })
      ]
    case 'poll_vote':
      return [
        formatMessage({ id: 'notification.poll_vote.title' }),
        formatMessage({ id: 'notification.poll_vote.body' }, { user: notification.account.acct })
      ]
    case 'quote':
      return [
        formatMessage({ id: 'notification.quote.title' }),
        formatMessage({ id: 'notification.quote.body' }, { user: notification.account.acct })
      ]
    case 'status':
      return [
        formatMessage({ id: 'notification.status.title' }),
        formatMessage({ id: 'notification.status.body' }, { user: notification.account.acct })
      ]
    case 'update':
      return [
        formatMessage({ id: 'notification.update.title' }),
        formatMessage({ id: 'notification.update.body' }, { user: notification.account.acct })
      ]
    case 'emoji_reaction':
    case 'reaction':
      return [
        formatMessage({ id: 'notification.emoji_reaction.title' }),
        formatMessage({ id: 'notification.emoji_reaction.body' }, { user: notification.account.acct })
      ]
    case 'mention':
      return [
        `${notification.account.acct}`,
        sanitizeHtml(notification.status!.content, {
          allowedTags: [],
          allowedAttributes: false
        })
      ]
    default:
      return ['', '']
  }
}

export default generateNotification
