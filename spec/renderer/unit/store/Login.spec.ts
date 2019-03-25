import Login from '@/store/Login'

describe('Login', () => {
  describe('mutations', () => {
    let state: any
    beforeEach(() => {
      state = {
        instances: [],
        selectedInstance: null,
        searching: false
      }
    })
    describe('changeInstance', () => {
      it('should be changed', () => {
        Login.mutations.changeInstance(state, 'pleroma.io')
        expect(state.selectedInstance).toEqual('pleroma.io')
      })
    })
    describe('changeSearching', () => {
      it('should be changed', () => {
        Login.mutations.changeSearching(state, true)
        expect(state.searching).toEqual(true)
      })
    })
  })
})
