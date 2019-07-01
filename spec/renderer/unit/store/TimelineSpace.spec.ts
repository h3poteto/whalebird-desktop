import TimelineSpace, { TimelineSpaceState, blankAccount, MUTATION_TYPES } from '~/src/renderer/store/TimelineSpace'
import { Emoji } from 'megalodon'
import unreadSettings from '~/src/constants/unreadNotification'

describe('TimelineSpace', () => {
  describe('mutations', () => {
    let state: TimelineSpaceState
    beforeEach(() => {
      state = {
        account: blankAccount,
        bindingAccount: null,
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
        const emacsEmoji: Emoji = {
          shortcode: 'emacs',
          url: 'http://example.com/emacs',
          static_url: 'http://example.com/emacs',
          visible_in_picker: true
        }
        const rubyEmoji: Emoji = {
          shortcode: 'ruby',
          url: 'http://example.com/ruby',
          static_url: 'http://example.com/ruby',
          visible_in_picker: true
        }
        TimelineSpace.mutations![MUTATION_TYPES.UPDATE_EMOJIS](state, [emacsEmoji, rubyEmoji])
        expect(state.emojis).toEqual([
          {
            image: 'http://example.com/emacs',
            name: ':emacs:'
          },
          {
            image: 'http://example.com/ruby',
            name: ':ruby:'
          }
        ])
      })
    })

    describe('updateTootMax', () => {
      describe('value is null', () => {
        it('should be updated with 500', () => {
          TimelineSpace.mutations![MUTATION_TYPES.UPDATE_TOOT_MAX](state, null)
          expect(state.tootMax).toEqual(500)
        })
      })
      describe('value is not null', () => {
        it('should be updated', () => {
          TimelineSpace.mutations![MUTATION_TYPES.UPDATE_TOOT_MAX](state, 1200)
          expect(state.tootMax).toEqual(1200)
        })
      })
    })
  })
})
