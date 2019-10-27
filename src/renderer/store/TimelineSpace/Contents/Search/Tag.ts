import Mastodon, { Tag, Results } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type TagState = {
  results: Array<Tag>
}

const state = (): TagState => ({
  results: []
})

export const MUTATION_TYPES = {
  UPDATE_RESULTS: 'updateResults'
}

const mutations: MutationTree<TagState> = {
  [MUTATION_TYPES.UPDATE_RESULTS]: (state, results: Array<Tag>) => {
    state.results = results
  }
}

const actions: ActionTree<TagState, RootState> = {
  search: ({ commit, rootState }, query: string): Promise<Array<Tag>> => {
    commit('TimelineSpace/Contents/changeLoading', true, { root: true })
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v2',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    return client
      .get<Results>('/search', { q: query, resolve: true })
      .then(res => {
        commit(MUTATION_TYPES.UPDATE_RESULTS, res.data.hashtags)
        return res.data.hashtags
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
} as Module<TagState, RootState>
