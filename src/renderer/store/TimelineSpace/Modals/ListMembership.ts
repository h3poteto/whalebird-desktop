import generator, { Entity } from 'megalodon'
import lodash from 'lodash'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type ListMembershipState = {
  modalOpen: boolean
  account: Entity.Account | null
  lists: Array<Entity.List>
  belongToLists: Array<Entity.List>
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
  [MUTATION_TYPES.CHANGE_ACCOUNT]: (state, account: Entity.Account) => {
    state.account = account
  },
  [MUTATION_TYPES.CHANGE_BELONG_TO_LISTS]: (state, lists: Array<Entity.List>) => {
    state.belongToLists = lists
  },
  [MUTATION_TYPES.CHANGE_LISTS]: (state, lists: Array<Entity.List>) => {
    state.lists = lists
  }
}

const actions: ActionTree<ListMembershipState, RootState> = {
  changeModal: ({ commit }, value: boolean) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, value)
  },
  setAccount: ({ commit }, account: Entity.Account) => {
    commit(MUTATION_TYPES.CHANGE_ACCOUNT, account)
  },
  fetchListMembership: async ({ commit, rootState }, account: Entity.Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getAccountLists(account.id)
    commit(
      MUTATION_TYPES.CHANGE_BELONG_TO_LISTS,
      res.data.map(l => l.id)
    )
    return res.data
  },
  fetchLists: async ({ commit, rootState }) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getLists()
    commit(MUTATION_TYPES.CHANGE_LISTS, res.data)
    return res.data
  },
  changeBelongToLists: async ({ rootState, commit, state }, belongToLists: Array<Entity.List>) => {
    // Calcurate diff
    const removedLists = lodash.difference(state.belongToLists, belongToLists)
    const addedLists = lodash.difference(belongToLists, state.belongToLists)
    commit(MUTATION_TYPES.CHANGE_BELONG_TO_LISTS, belongToLists)
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const removedPromise = removedLists.map(list => {
      return client.deleteAccountsFromList(list.id, [state.account!.id])
    })
    const addedPromise = addedLists.map(list => {
      return client.addAccountsToList(list.id, [state.account!.id])
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
