import TimelineSpace, { TimelineSpaceState, blankAccount, MUTATION_TYPES } from '~/src/renderer/store/TimelineSpace'
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
        pleroma: false
      }
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
