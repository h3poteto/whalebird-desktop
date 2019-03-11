import TimelineSpace from '~/src/renderer/store/TimelineSpace'
import unreadSettings from '~/src/constants/unreadNotification'

describe('TimelineSpace', () => {
  describe('mutations', () => {
    let state
    beforeEach(() => {
      state = {
        account: {
          domain: '',
          _id: '',
          username: ''
        },
        loading: false,
        emojis: [],
        tootMax: 500,
        unreadNotification: {
          direct: unreadSettings.Direct.default,
          local: unreadSettings.Local.default,
          public: unreadSettings.Public.default
        },
        useWebsocket: false,
        pleroma: false
      }
    })

    describe('updateEmojis', () => {
      it('should be updated', () => {
        TimelineSpace.mutations.updateEmojis(state, [
          {
            shortcode: 'emacs',
            url: 'http://example.com/emacs'
          },
          {
            shortcode: 'ruby',
            url: 'http://example.com/ruby'
          }
        ])
        expect(state.emojis).toEqual([
          {
            name: ':emacs:',
            image: 'http://example.com/emacs'
          },
          {
            name: ':ruby:',
            image: 'http://example.com/ruby'
          }
        ])
      })
    })

    describe('updateTootMax', () => {
      describe('value is null', () => {
        it('should be updated with 500', () => {
          TimelineSpace.mutations.updateTootMax(state, null)
          expect(state.tootMax).toEqual(500)
        })
      })
      describe('value is not null', () => {
        it('should be updated', () => {
          TimelineSpace.mutations.updateTootMax(state, 1200)
          expect(state.tootMax).toEqual(1200)
        })
      })
    })
  })
})
