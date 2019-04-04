import Login, { LoginState, MUTATION_TYPES } from '@/store/Login'

describe('Login', () => {
  describe('mutations', () => {
    let state: LoginState
    beforeEach(() => {
      state = {
        selectedInstance: null,
        searching: false
      }
    })
    describe('changeInstance', () => {
      it('should be changed', () => {
        Login.mutations![MUTATION_TYPES.CHANGE_INSTANCE](state, 'pleroma.io')
        expect(state.selectedInstance).toEqual('pleroma.io')
      })
    })
    describe('changeSearching', () => {
      it('should be changed', () => {
        Login.mutations![MUTATION_TYPES.CHANGE_SEARCHING](state, true)
        expect(state.searching).toEqual(true)
      })
    })
  })
})
