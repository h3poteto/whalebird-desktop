import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type NetworkState = {
  source: 'no' | 'system' | 'manual'
}

const state = (): NetworkState => {
  return {
    source: 'no'
  }
}

export const MUTATION_TYPES = {
  CHANGE_SOURCE: 'changeSource'
}

const mutations: MutationTree<NetworkState> = {
  [MUTATION_TYPES.CHANGE_SOURCE]: (state, source: 'no' | 'system' | 'manual') => {
    state.source = source
  }
}

const actions: ActionTree<NetworkState, RootState> = {
  changeSource: ({ commit }, source: string) => {
    commit(MUTATION_TYPES.CHANGE_SOURCE, source)
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<NetworkState, RootState>
