import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type IndexState = {
  lists: Array<Entity.List>
}

const state = (): IndexState => ({
  lists: []
})

export const MUTATION_TYPES = {
  CHANGE_LISTS: 'changeLists'
}

const mutations: MutationTree<IndexState> = {
  [MUTATION_TYPES.CHANGE_LISTS]: (state, lists: Array<Entity.List>) => {
    state.lists = lists
  }
}

const actions: ActionTree<IndexState, RootState> = {
  fetchLists: async ({ commit, rootState }): Promise<Array<Entity.List>> => {
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
  createList: async ({ rootState }, title: string): Promise<Entity.List> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.createList(title)
    return res.data
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<IndexState, RootState>
