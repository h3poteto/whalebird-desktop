import { Module, MutationTree, ActionTree } from 'vuex'
import { toRaw } from 'vue'
import { LocalAccount } from '~/src/types/localAccount'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LocalServer } from '~src/types/localServer'

const win = (window as any) as MyWindow

export type AccountState = {
  accounts: Array<[LocalAccount, LocalServer]>
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
  [MUTATION_TYPES.UPDATE_ACCOUNTS]: (state, accounts: Array<[LocalAccount, LocalServer]>) => {
    state.accounts = accounts
  },
  [MUTATION_TYPES.UPDATE_ACCOUNT_LOADING]: (state, value: boolean) => {
    state.accountLoading = value
  }
}

export const ACTION_TYPES = {
  LOAD_ACCOUNTS: 'loadAccounts',
  REMOVE_ACCOUNT: 'removeAccount',
  FORWARD_ACCOUNT: 'forwardAccount',
  BACKWARD_ACCOUNT: 'backwardAccount',
  REMOVE_ALL_ACCOUNTS: 'removeAllAccounts'
}

const actions: ActionTree<AccountState, RootState> = {
  [ACTION_TYPES.LOAD_ACCOUNTS]: async ({ commit }): Promise<Array<[LocalAccount, LocalServer]>> => {
    const accounts: Array<[LocalAccount, LocalServer]> = await win.ipcRenderer.invoke('list-accounts')
    commit(MUTATION_TYPES.UPDATE_ACCOUNTS, accounts)
    return accounts
  },
  [ACTION_TYPES.REMOVE_ACCOUNT]: async (_, account: LocalAccount) => {
    await win.ipcRenderer.invoke('remove-account', account.id)
  },
  [ACTION_TYPES.FORWARD_ACCOUNT]: async (_, account: LocalAccount) => {
    await win.ipcRenderer.invoke('forward-account', toRaw(account))
  },
  [ACTION_TYPES.BACKWARD_ACCOUNT]: async (_, account: LocalAccount) => {
    await win.ipcRenderer.invoke('backward-account', toRaw(account))
  },
  [ACTION_TYPES.REMOVE_ALL_ACCOUNTS]: async () => {
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
