import Account from '@/store/Preferences/Account'

describe('Preferences/Account', () => {
  describe('mutations', () => {
    let state
    beforeEach(() => {
      state = {
        accounts: [],
        accountLoading: false
      }
    })
    describe('updateAccounts', () => {
      it('should be updated', () => {
        Account.mutations.updateAccounts(state, ['account'])
        expect(state.accounts).toEqual(['account'])
      })
    })
    describe('updateAccountLoading', () => {
      it('should be update', () => {
        Account.mutations.updateAccountLoading(state, true)
        expect(state.accountLoading).toEqual(true)
      })
    })
  })
})
