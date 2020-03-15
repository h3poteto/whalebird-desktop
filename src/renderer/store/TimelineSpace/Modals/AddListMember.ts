import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type AddListMemberState = {
  modalOpen: boolean
  accounts: Array<Entity.Account>
  targetListId: string | null
}

const state = (): AddListMemberState => ({
  modalOpen: false,
  accounts: [],
  targetListId: null
})

export const MUTATION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  UPDATE_ACCOUNTS: 'updateAccounts',
  SET_LIST_ID: 'setListId'
}

const mutations: MutationTree<AddListMemberState> = {
  [MUTATION_TYPES.CHANGE_MODAL]: (state, value: boolean) => {
    state.modalOpen = value
  },
  [MUTATION_TYPES.UPDATE_ACCOUNTS]: (state, accounts: Array<Entity.Account>) => {
    state.accounts = accounts
  },
  [MUTATION_TYPES.SET_LIST_ID]: (state, id: string) => {
    state.targetListId = id
  }
}

const actions: ActionTree<AddListMemberState, RootState> = {
  changeModal: ({ commit }, value: boolean) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, value)
  },
  search: async ({ commit, rootState }, name: string): Promise<Array<Entity.Account>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.searchAccount(name, { following: true })
    commit(MUTATION_TYPES.UPDATE_ACCOUNTS, res.data)
    return res.data
  },
  add: async ({ state, rootState }, account: Account): Promise<{}> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.addAccountsToList(state.targetListId!, [account.id])
    return res.data
  }
}

const AddListMember: Module<AddListMemberState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default AddListMember
