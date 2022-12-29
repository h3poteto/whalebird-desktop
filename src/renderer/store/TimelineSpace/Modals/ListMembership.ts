import generator, { Entity } from 'megalodon'
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

export const ACTION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  SET_ACCOUNT: 'setAccount',
  FETCH_LIST_MEMBERSHIP: 'fetchListMembership',
  FETCH_LISTS: 'fetchLists',
  CHANGE_BELONG_TO_LISTS: 'changeBelongToLists'
}

const actions: ActionTree<ListMembershipState, RootState> = {
  [ACTION_TYPES.CHANGE_MODAL]: ({ commit }, value: boolean) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, value)
  },
  [ACTION_TYPES.SET_ACCOUNT]: ({ commit }, account: Entity.Account) => {
    commit(MUTATION_TYPES.CHANGE_ACCOUNT, account)
  },
  [ACTION_TYPES.FETCH_LIST_MEMBERSHIP]: async ({ commit, rootState }, account: Entity.Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.getAccountLists(account.id)
    commit(MUTATION_TYPES.CHANGE_BELONG_TO_LISTS, res.data)
    return res.data
  },
  [ACTION_TYPES.FETCH_LISTS]: async ({ commit, rootState }) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.getLists()
    commit(MUTATION_TYPES.CHANGE_LISTS, res.data)
    return res.data
  },
  [ACTION_TYPES.CHANGE_BELONG_TO_LISTS]: async ({ rootState, dispatch, state }, belongToLists: Array<string>) => {
    // Calculate diff
    const removedLists = state.belongToLists.map(l => l.id).filter(i => belongToLists.indexOf(i) === -1)
    const addedLists = belongToLists.filter(i => state.belongToLists.map(l => l.id).indexOf(i) === -1)
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const removedPromise = removedLists.map(id => {
      return client.deleteAccountsFromList(id, [state.account!.id])
    })
    const addedPromise = addedLists.map(id => {
      return client.addAccountsToList(id, [state.account!.id])
    })
    const res = await Promise.all(removedPromise.concat(addedPromise))
    await dispatch('fetchListMembership', state.account!)
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
