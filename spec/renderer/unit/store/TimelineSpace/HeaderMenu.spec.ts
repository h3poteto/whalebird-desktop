import HeaderMenu, { HeaderMenuState, MUTATION_TYPES } from '@/store/TimelineSpace/HeaderMenu'

describe('TimelineSpace/HeaderMenu', () => {
  describe('mutations', () => {
    let state: HeaderMenuState
    beforeEach(() => {
      state = {
        title: 'Home',
        reload: false
      }
    })
    describe('changeReload', () => {
      it('should be changed', () => {
        HeaderMenu.mutations![MUTATION_TYPES.CHANGE_RELOAD](state, true)
        expect(state.reload).toEqual(true)
      })
    })
  })
})
