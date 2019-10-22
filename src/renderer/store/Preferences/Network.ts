import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'

export type NetworkState = {
  source: 'no' | 'system' | 'manual'
  proxy: {
    protocol: string
    host: string
    port: string
  }
}

const state = (): NetworkState => {
  return {
    source: 'no',
    proxy: {
      protocol: '',
      host: '',
      port: ''
    }
  }
}

export const MUTATION_TYPES = {
  CHANGE_SOURCE: 'changeSource',
  UPDATE_PROTOCOL: 'updateProtocol',
  UPDATE_HOST: 'updateHost',
  UPDATE_PORT: 'updatePort'
}

const mutations: MutationTree<NetworkState> = {
  [MUTATION_TYPES.CHANGE_SOURCE]: (state, source: 'no' | 'system' | 'manual') => {
    state.source = source
  },
  [MUTATION_TYPES.UPDATE_PROTOCOL]: (state, protocol: string) => {
    state.proxy.protocol = protocol
  },
  [MUTATION_TYPES.UPDATE_HOST]: (state, host: string) => {
    state.proxy.host = host
  },
  [MUTATION_TYPES.UPDATE_PORT]: (state, port: string) => {
    state.proxy.port = port
  }
}

const actions: ActionTree<NetworkState, RootState> = {
  changeSource: ({ commit }, source: string) => {
    commit(MUTATION_TYPES.CHANGE_SOURCE, source)
  },
  updateProtocol: ({ commit }, protocol: string) => {
    commit(MUTATION_TYPES.UPDATE_PROTOCOL, protocol)
  },
  updateHost: ({ commit }, host: string) => {
    commit(MUTATION_TYPES.UPDATE_HOST, host)
  },
  updatePort: ({ commit }, port: string) => {
    commit(MUTATION_TYPES.UPDATE_PORT, port)
  }
}

const getters: GetterTree<NetworkState, RootState> = {
  manualProxyConfiguration: state => {
    return state.source === 'manual'
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
} as Module<NetworkState, RootState>
