import Notification, { NotificationState, MUTATION_TYPES } from '@/store/Preferences/Notification'

describe('Preferences/Notification', () => {
  let state: NotificationState
  beforeEach(() => {
    state = {
      notification: {
        notify: {
          reply: true,
          reblog: true,
          favourite: true,
          follow: true,
          follow_request: true,
          reaction: true,
          status: true,
          poll_vote: true,
          poll_expired: true
        }
      }
    }
  })
  describe('mutations', () => {
    it('updateNotification', () => {
      Notification.mutations![MUTATION_TYPES.UPDATE_NOTIFICATION](state, {
        notify: {
          reply: false,
          reblog: false,
          favourite: false,
          follow: false,
          follow_request: false,
          reaction: false,
          status: false,
          poll_vote: false,
          poll_expired: false
        }
      })
      expect(state.notification.notify).toEqual({
        reply: false,
        reblog: false,
        favourite: false,
        follow: false,
        follow_request: false,
        reaction: false,
        status: false,
        poll_vote: false,
        poll_expired: false
      })
    })
  })
})
