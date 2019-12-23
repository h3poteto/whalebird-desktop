import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { BaseConfig } from '~/src/types/preference'
import { Proxy, ProxySource, ProxyProtocol, ManualProxy } from '~/src/types/proxy'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type NetworkState = {
  source: ProxySource
  proxy: ManualProxy
}

const state = (): NetworkState => {
  return {
    source: ProxySource.system,
    proxy: {
      protocol: '',
      host: '',
      port: '',
      username: '',
      password: ''
    }
  }
}

export const MUTATION_TYPES = {
  UPDATE_PROXY: 'updateProxy',
  CHANGE_SOURCE: 'changeSource',
  UPDATE_PROTOCOL: 'updateProtocol',
  UPDATE_HOST: 'updateHost',
  UPDATE_PORT: 'updatePort',
  UPDATE_USERNAME: 'updateUsername',
  UPDATE_PASSWORD: 'updatePassword'
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
  },
  [MUTATION_TYPES.UPDATE_USERNAME]: (state, username: string) => {
    state.proxy.username = username
  },
  [MUTATION_TYPES.UPDATE_PASSWORD]: (state, password: string) => {
    state.proxy.password = password
  }
}

const actions: ActionTree<NetworkState, RootState> = {
  loadProxy: ({ commit }) => {
    return new Promise((resolve, reject) => {
      win.ipcRenderer.send('get-preferences')
      win.ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        win.ipcRenderer.removeAllListeners('response-get-preferences')
        reject(err)
      })
      win.ipcRenderer.once('response-get-preferences', (_, conf: BaseConfig) => {
        win.ipcRenderer.removeAllListeners('error-get-preferences')
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
  updateUsername: ({ commit }, username: string) => {
    commit(MUTATION_TYPES.UPDATE_USERNAME, username)
  },
  updatePassword: ({ commit }, password: string) => {
    commit(MUTATION_TYPES.UPDATE_PASSWORD, password)
  },
  saveProxyConfig: ({ state, dispatch }) => {
    const proxy: Proxy = {
      source: state.source,
      manualProxyConfig: state.proxy
    }
    win.ipcRenderer.once('response-update-proxy-config', async () => {
      dispatch('App/loadProxy', {}, { root: true })
      // Originally we have to restart all streamings after user change proxy configuration.
      // But streamings are restart after close preferences.
      // So we don't have to restart streaming here.
    })
    win.ipcRenderer.send('update-proxy-config', proxy)
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
