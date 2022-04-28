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

export const ACTION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  SEARCH: 'search',
  ADD: 'add'
}

const actions: ActionTree<AddListMemberState, RootState> = {
  [ACTION_TYPES.CHANGE_MODAL]: ({ commit }, value: boolean) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, value)
  },
  [ACTION_TYPES.SEARCH]: async ({ commit, rootState }, name: string): Promise<Array<Entity.Account>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.searchAccount(name, { following: true })
    commit(MUTATION_TYPES.UPDATE_ACCOUNTS, res.data)
    return res.data
  },
  [ACTION_TYPES.ADD]: async ({ state, rootState }, account: Entity.Account): Promise<{}> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
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
