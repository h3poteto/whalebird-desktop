import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type TootsState = {
  results: Array<Entity.Status>
}

const state = (): TootsState => ({
  results: []
})

export const MUTATION_TYPES = {
  UPDATE_RESULTS: 'updateResults'
}

const mutations: MutationTree<TootsState> = {
  [MUTATION_TYPES.UPDATE_RESULTS]: (state, results: Array<Entity.Status>) => {
    state.results = results
  }
}

export const ACTION_TYPES = {
  SEARCH: 'search'
}

const actions: ActionTree<TootsState, RootState> = {
  [ACTION_TYPES.SEARCH]: async ({ commit, rootState }, query: string): Promise<Array<Entity.Status>> => {
    commit('TimelineSpace/Contents/changeLoading', true, { root: true })
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    return client
      .search(query, 'statuses', { resolve: true })
      .then(res => {
        commit(MUTATION_TYPES.UPDATE_RESULTS, res.data.statuses)
        return res.data.statuses
      })
      .finally(() => {
        commit('TimelineSpace/Contents/changeLoading', false, { root: true })
      })
  }
}

const Toots: Module<TootsState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Toots
