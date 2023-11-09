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
        formatMessage({ id: 'timeline.notification.follow.title' }),
        formatMessage({ id: 'timeline.notification.follow.body' }, { user: notification.account.acct })
      ]
    case 'follow_request':
      return [
        formatMessage({ id: 'timeline.notification.follow_request.title' }),
        formatMessage({ id: 'timeline.notification.follow_requested.body' }, { user: notification.account.acct })
      ]
    case 'favourite':
      return [
        formatMessage({ id: 'timeline.notification.favourite.title' }),
        formatMessage({ id: 'timeline.notification.favourite.body' }, { user: notification.account.acct })
      ]
    case 'reblog':
      return [
        formatMessage({ id: 'timeline.notification.reblog.title' }),
        formatMessage({ id: 'timeline.notification.reblog.body' }, { user: notification.account.acct })
      ]
    case 'poll_expired':
      return [
        formatMessage({ id: 'timeline.notification.poll_expired.title' }),
        formatMessage({ id: 'timeline.notification.poll_expired.body' }, { user: notification.account.acct })
      ]
    case 'poll_vote':
      return [
        formatMessage({ id: 'timeline.notification.poll_vote.title' }),
        formatMessage({ id: 'timeline.notification.poll_vote.body' }, { user: notification.account.acct })
      ]
    case 'quote':
      return [
        formatMessage({ id: 'timeline.notification.quote.title' }),
        formatMessage({ id: 'timeline.notification.quote.body' }, { user: notification.account.acct })
      ]
    case 'status':
      return [
        formatMessage({ id: 'timeline.notification.status.title' }),
        formatMessage({ id: 'timeline.notification.status.body' }, { user: notification.account.acct })
      ]
    case 'update':
      return [
        formatMessage({ id: 'timeline.notification.update.title' }),
        formatMessage({ id: 'timeline.notification.update.body' }, { user: notification.account.acct })
      ]
    case 'emoji_reaction':
    case 'reaction':
      return [
        formatMessage({ id: 'timeline.notification.emoji_reaction.title' }),
        formatMessage({ id: 'timeline.notification.emoji_reaction.body' }, { user: notification.account.acct })
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
