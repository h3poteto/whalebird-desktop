import TimelineSpace, { TimelineSpaceState, MUTATION_TYPES } from '~/src/renderer/store/TimelineSpace'
import { DefaultSetting } from '~/src/constants/initializer/setting'

describe('TimelineSpace', () => {
  describe('mutations', () => {
    let state: TimelineSpaceState
    beforeEach(() => {
      state = {
        account: null,
        server: null,
        loading: false,
        emojis: [],
        tootMax: 500,
        setting: DefaultSetting,
        filters: []
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
