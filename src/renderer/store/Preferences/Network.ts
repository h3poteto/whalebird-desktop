import { ipcRenderer } from 'electron'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { BaseConfig } from '~/src/types/preference'
import { Proxy, ProxySource, ProxyProtocol } from '~/src/types/proxy'

export type NetworkState = {
  source: ProxySource
  proxy: {
    protocol: '' | ProxyProtocol
    host: string
    port: string
  }
}

const state = (): NetworkState => {
  return {
    source: ProxySource.no,
    proxy: {
      protocol: '',
      host: '',
      port: ''
    }
  }
}

export const MUTATION_TYPES = {
  UPDATE_PROXY: 'updateProxy',
  CHANGE_SOURCE: 'changeSource',
  UPDATE_PROTOCOL: 'updateProtocol',
  UPDATE_HOST: 'updateHost',
  UPDATE_PORT: 'updatePort'
}

const mutations: MutationTree<NetworkState> = {
  [MUTATION_TYPES.UPDATE_PROXY]: (state, config: Proxy) => {
    state.source = config.source
    state.proxy = config.manualProxyConfig
  },
  [MUTATION_TYPES.CHANGE_SOURCE]: (state, source: 'no' | 'system' | 'manual') => {
    switch (source) {
      case 'no':
        state.source = ProxySource.no
        break
      case 'system':
        state.source = ProxySource.system
        break
      case 'manual':
        state.source = ProxySource.manual
        break
    }
  },
  [MUTATION_TYPES.UPDATE_PROTOCOL]: (state, protocol: '' | 'http' | 'https' | 'socks4' | 'socks4a' | 'socks5' | 'socks5h') => {
    switch (protocol) {
      case 'http':
        state.proxy.protocol = ProxyProtocol.http
        break
      case 'https':
        state.proxy.protocol = ProxyProtocol.https
        break
      case 'socks4':
        state.proxy.protocol = ProxyProtocol.socks4
        break
      case 'socks4a':
        state.proxy.protocol = ProxyProtocol.socks4a
        break
      case 'socks5':
        state.proxy.protocol = ProxyProtocol.socks5
        break
      case 'socks5h':
        state.proxy.protocol = ProxyProtocol.socks5h
        break
      default:
        state.proxy.protocol = ''
        break
    }
  },
  [MUTATION_TYPES.UPDATE_HOST]: (state, host: string) => {
    state.proxy.host = host
  },
  [MUTATION_TYPES.UPDATE_PORT]: (state, port: string) => {
    state.proxy.port = port
  }
}

const actions: ActionTree<NetworkState, RootState> = {
  loadProxy: ({ commit }) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-preferences')
      ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-preferences')
        reject(err)
      })
      ipcRenderer.once('response-get-preferences', (_, conf: BaseConfig) => {
        ipcRenderer.removeAllListeners('error-get-preferences')
        commit(MUTATION_TYPES.UPDATE_PROXY, conf.proxy as Proxy)
        resolve(conf)
      })
    })
  },
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
  },
  saveProxyConfig: ({ state }) => {
    ipcRenderer.send('update-proxy-config', state)
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
