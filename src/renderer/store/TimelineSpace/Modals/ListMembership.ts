import Mastodon, { Account, List, Response } from 'megalodon'
import lodash from 'lodash'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type ListMembershipState = {
  modalOpen: boolean
  account: Account | null
  lists: Array<List>
  belongToLists: Array<List>
}

const state = (): ListMembershipState => ({
  modalOpen: false,
  account: null,
  lists: [],
  belongToLists: []
})

export const MUTATION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  CHANGE_ACCOUNT: 'changeAccount',
  CHANGE_BELONG_TO_LISTS: 'changeBelongToLists',
  CHANGE_LISTS: 'changeLists'
}

const mutations: MutationTree<ListMembershipState> = {
  [MUTATION_TYPES.CHANGE_MODAL]: (state, value: boolean) => {
    state.modalOpen = value
  },
  [MUTATION_TYPES.CHANGE_ACCOUNT]: (state, account: Account) => {
    state.account = account
  },
  [MUTATION_TYPES.CHANGE_BELONG_TO_LISTS]: (state, lists: Array<List>) => {
    state.belongToLists = lists
  },
  [MUTATION_TYPES.CHANGE_LISTS]: (state, lists: Array<List>) => {
    state.lists = lists
  }
}

const actions: ActionTree<ListMembershipState, RootState> = {
  changeModal: ({ commit }, value: boolean) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, value)
  },
  setAccount: ({ commit }, account: Account) => {
    commit(MUTATION_TYPES.CHANGE_ACCOUNT, account)
  },
  fetchListMembership: async ({ commit, rootState }, account: Account) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Array<List>> = await client.get<Array<List>>(`/accounts/${account.id}/lists`)
    commit(MUTATION_TYPES.CHANGE_BELONG_TO_LISTS, res.data.map(l => l.id))
    return res.data
  },
  fetchLists: async ({ commit, rootState }) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Array<List>> = await client.get<Array<List>>('/lists')
    commit(MUTATION_TYPES.CHANGE_LISTS, res.data)
    return res.data
  },
  changeBelongToLists: async ({ rootState, commit, state }, belongToLists: Array<List>) => {
    // Calcurate diff
    const removedLists = lodash.difference(state.belongToLists, belongToLists)
    const addedLists = lodash.difference(belongToLists, state.belongToLists)
    commit(MUTATION_TYPES.CHANGE_BELONG_TO_LISTS, belongToLists)
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const removedPromise = removedLists.map(id => {
      return client.del<{}>(`/lists/${id}/accounts`, {
        account_ids: [state.account!.id]
      })
    })
    const addedPromise = addedLists.map(id => {
      return client.post<{}>(`/lists/${id}/accounts`, {
        account_ids: [state.account!.id]
      })
    })
    const res = await Promise.all(removedPromise.concat(addedPromise))
    return res
  }
}

const ListMembership: Module<ListMembershipState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default ListMembership
