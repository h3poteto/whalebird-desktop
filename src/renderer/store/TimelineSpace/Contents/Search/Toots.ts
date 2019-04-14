import Mastodon, { Status, Results } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface TootsState {
  results: Array<Status>
}

const state = (): TootsState => ({
  results: []
})

export const MUTATION_TYPES = {
  UPDATE_RESULTS: 'updateResults'
}

const mutations: MutationTree<TootsState> = {
  [MUTATION_TYPES.UPDATE_RESULTS]: (state, results: Array<Status>) => {
    state.results = results
  }
}

const actions: ActionTree<TootsState, RootState> = {
  search: ({ commit, rootState }, query: string): Promise<Array<Status>> => {
    commit('TimelineSpace/Contents/Search/changeLoading', true, { root: true })
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    return client.get<Results>('/search', { q: query, resolve: true })
      .then(res => {
        commit(MUTATION_TYPES.UPDATE_RESULTS, res.data.statuses)
        return res.data.statuses
      })
      .finally(() => {
        commit('TimelineSpace/Contents/Search/changeLoading', false, { root: true })
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
