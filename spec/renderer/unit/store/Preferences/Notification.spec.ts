import Notification from '@/store/Preferences/Notification'

describe('Preferences/Notification', () => {
  let state
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
      Notification.mutations.updateNotification(state, {
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
