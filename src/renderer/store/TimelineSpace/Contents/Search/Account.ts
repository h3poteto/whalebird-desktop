import Mastodon, { Account } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface AccountState {
  results: Array<Account>
}

const state = (): AccountState => ({
  results: []
})

export const MUTATION_TYPES = {
  UPDATE_RESULTS: 'updateResults'
}

const mutations: MutationTree<AccountState> = {
  [MUTATION_TYPES.UPDATE_RESULTS]: (state, results: Array<Account>) => {
    state.results = results
  }
}

const actions: ActionTree<AccountState, RootState> = {
  search: async ({ commit, rootState }, query: string): Promise<Array<Account>> => {
    commit('TimelineSpace/Contents/changeLoading', true, { root: true })
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    return client
      .get<Array<Account>>('/accounts/search', { q: query, resolve: true })
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
