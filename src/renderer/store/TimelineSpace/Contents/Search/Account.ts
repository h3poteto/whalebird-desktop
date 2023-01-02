import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type AccountState = {
  results: Array<Entity.Account>
}

const state = (): AccountState => ({
  results: []
})

export const MUTATION_TYPES = {
  UPDATE_RESULTS: 'updateResults'
}

const mutations: MutationTree<AccountState> = {
  [MUTATION_TYPES.UPDATE_RESULTS]: (state, results: Array<Entity.Account>) => {
    state.results = results
  }
}

export const ACTION_TYPES = {
  SEARCH: 'search'
}

const actions: ActionTree<AccountState, RootState> = {
  [ACTION_TYPES.SEARCH]: async ({ commit, rootState }, query: string): Promise<Array<Entity.Account>> => {
    commit('TimelineSpace/Contents/changeLoading', true, { root: true })
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    return client
      .searchAccount(query, { resolve: true })
      .then(res => {
        commit(MUTATION_TYPES.UPDATE_RESULTS, res.data)
        return res.data
      })
      .finally(() => {
        commit('TimelineSpace/Contents/changeLoading', false, { root: true })
      })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<AccountState, RootState>
