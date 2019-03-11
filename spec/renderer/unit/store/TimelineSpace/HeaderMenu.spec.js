import HeaderMenu from '@/store/TimelineSpace/HeaderMenu'

describe('TimelineSpace/HeaderMenu', () => {
  describe('mutations', () => {
    let state
    beforeEach(() => {
      state = {
        title: 'Home',
        reload: false
      }
    })
    describe('changeReload', () => {
      it('should be changed', () => {
        HeaderMenu.mutations.changeReload(state, true)
        expect(state.reload).toEqual(true)
      })
    })
  })
})
