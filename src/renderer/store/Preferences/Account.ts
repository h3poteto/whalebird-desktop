import { Module, MutationTree, ActionTree } from 'vuex'
import { LocalAccount } from '~/src/types/localAccount'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

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
  loadAccounts: async ({ commit }): Promise<Array<LocalAccount>> => {
    const accounts = await win.ipcRenderer.invoke('list-accounts')
    commit(MUTATION_TYPES.UPDATE_ACCOUNTS, accounts)
    return accounts
  },
  removeAccount: async (_, account: LocalAccount) => {
    await win.ipcRenderer.invoke('remove-account', account._id)
  },
  forwardAccount: async (_, account: LocalAccount) => {
    await win.ipcRenderer.invoke('forward-account', account)
  },
  backwardAccount: async (_, account: LocalAccount) => {
    await win.ipcRenderer.invoke('backward-account', account)
  },
  removeAllAccounts: async () => {
    await win.ipcRenderer.invoke('remove-all-accounts')
  }
}

const account: Module<AccountState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default account
