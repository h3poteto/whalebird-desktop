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
          follow: true
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
          follow: false
        }
      })
      expect(state.notification.notify).toEqual({
        reply: false,
        reblog: false,
        favourite: false,
        follow: false
      })
    })
  })
})
