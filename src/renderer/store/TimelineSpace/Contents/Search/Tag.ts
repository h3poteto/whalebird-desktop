import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type TagState = {
  results: Array<Entity.Tag>
}

const state = (): TagState => ({
  results: []
})

export const MUTATION_TYPES = {
  UPDATE_RESULTS: 'updateResults'
}

const mutations: MutationTree<TagState> = {
  [MUTATION_TYPES.UPDATE_RESULTS]: (state, results: Array<Entity.Tag>) => {
    state.results = results
  }
}

export const ACTION_TYPES = {
  SEARCH: 'search'
}

const actions: ActionTree<TagState, RootState> = {
  [ACTION_TYPES.SEARCH]: async ({ commit, rootState }, query: string): Promise<Array<Entity.Tag>> => {
    commit('TimelineSpace/Contents/changeLoading', true, { root: true })
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    return client
      .search(query, 'hashtags', { resolve: true })
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
