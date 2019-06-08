import Account, { AccountState, MUTATION_TYPES } from '@/store/Preferences/Account'
import { LocalAccount } from '~/src/types/localAccount'

const account: LocalAccount = {
  _id: 'sample',
  baseURL: 'http://example.com',
  domain: 'example.com',
  clientId: 'hoge',
  clientSecret: 'hogehoge',
  accessToken: null,
  refreshToken: null,
  username: null,
  accountId: null,
  avatar: null,
  order: 1
}

describe('Preferences/Account', () => {
  describe('mutations', () => {
    let state: AccountState
    beforeEach(() => {
      state = {
        accounts: [],
        accountLoading: false
      }
    })
    describe('updateAccounts', () => {
      it('should be updated', () => {
        Account.mutations![MUTATION_TYPES.UPDATE_ACCOUNTS](state, [account])
        expect(state.accounts).toEqual([account])
      })
    })
    describe('updateAccountLoading', () => {
      it('should be update', () => {
        Account.mutations![MUTATION_TYPES.UPDATE_ACCOUNT_LOADING](state, true)
        expect(state.accountLoading).toEqual(true)
      })
    })
  })
})
