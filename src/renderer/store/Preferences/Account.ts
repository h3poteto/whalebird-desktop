import { ipcRenderer } from 'electron'
import { Module, MutationTree, ActionTree } from 'vuex'
import { LocalAccount } from '~/src/types/localAccount'
import { RootState } from '@/store'

export type AccountState = {
  accounts: Array<LocalAccount>
  accountLoading: boolean
}

const state = (): AccountState => ({
  accounts: [],
  accountLoading: false
})

export const MUTATION_TYPES = {
  UPDATE_ACCOUNTS: 'updateAccounts',
  UPDATE_ACCOUNT_LOADING: 'updateAccountLoading'
}

const mutations: MutationTree<AccountState> = {
  [MUTATION_TYPES.UPDATE_ACCOUNTS]: (state, accounts: Array<LocalAccount>) => {
    state.accounts = accounts
  },
  [MUTATION_TYPES.UPDATE_ACCOUNT_LOADING]: (state, value: boolean) => {
    state.accountLoading = value
  }
}

const actions: ActionTree<AccountState, RootState> = {
  loadAccounts: ({ commit }): Promise<Array<LocalAccount>> => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('list-accounts', 'list')
      ipcRenderer.once('error-list-accounts', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-list-accounts')
        reject(err)
      })
      ipcRenderer.once('response-list-accounts', (_, accounts: Array<LocalAccount>) => {
        ipcRenderer.removeAllListeners('error-list-accounts')
        commit(MUTATION_TYPES.UPDATE_ACCOUNTS, accounts)
        resolve(accounts)
      })
    })
  },
  removeAccount: (_, account: LocalAccount) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('remove-account', account._id)
      ipcRenderer.once('error-remove-account', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-remove-account')
        reject(err)
      })
      ipcRenderer.once('response-remove-account', () => {
        ipcRenderer.removeAllListeners('error-remove-account')
        resolve()
      })
    })
  },
  forwardAccount: (_, account: LocalAccount) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('forward-account', account)
      ipcRenderer.once('error-forward-account', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-forward-account')
        reject(err)
      })
      ipcRenderer.once('response-forward-account', () => {
        ipcRenderer.removeAllListeners('error-forward-account')
        resolve()
      })
    })
  },
  backwardAccount: (_, account: LocalAccount) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('backward-account', account)
      ipcRenderer.once('error-backward-account', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-forward-account')
        reject(err)
      })
      ipcRenderer.once('response-backward-account', () => {
        ipcRenderer.removeAllListeners('error-backward-account')
        resolve()
      })
    })
  },
  removeAllAccounts: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('remove-all-accounts')
      ipcRenderer.once('error-remove-all-accounts', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-remove-all-accounts')
        reject(err)
      })
      ipcRenderer.once('response-remove-all-accounts', () => {
        ipcRenderer.removeAllListeners('error-remove-all-accounts')
        resolve()
      })
    })
  }
}

const account: Module<AccountState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default account
