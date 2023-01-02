import Login, { LoginState, MUTATION_TYPES } from '@/store/Login'

describe('Login', () => {
  describe('mutations', () => {
    let state: LoginState
    beforeEach(() => {
      state = {
        domain: null,
        searching: false,
        server: null,
        appData: null,
        sns: 'mastodon'
      }
    })
    describe('changeInstance', () => {
      it('should be changed', () => {
        Login.mutations![MUTATION_TYPES.CHANGE_DOMAIN](state, 'pleroma.io')
        expect(state.domain).toEqual('pleroma.io')
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
