import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { BaseConfig } from '~/src/types/preference'
import { Proxy, ProxySource, ProxyProtocol, ManualProxy } from '~/src/types/proxy'
import { MyWindow } from '~/src/types/global'

const win = window as any as MyWindow

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

export const ACTION_TYPES = {
  LOAD_PROXY: 'loadProxy',
  CHANGE_SOURCE: 'changeSource',
  UPDATE_PROTOCOL: 'updateProtocol',
  UPDATE_HOST: 'updateHost',
  UPDATE_PORT: 'updatePort',
  UPDATE_USERNAME: 'updateUsername',
  UPDATE_PASSWORD: 'updatePassword',
  SAVE_PROXY_CONFIG: 'saveProxyConfig'
}

const actions: ActionTree<NetworkState, RootState> = {
  [ACTION_TYPES.LOAD_PROXY]: async ({ commit }) => {
    const conf: BaseConfig = await win.ipcRenderer.invoke('get-preferences')
    commit(MUTATION_TYPES.UPDATE_PROXY, conf.proxy as Proxy)
    return conf
  },
  [ACTION_TYPES.CHANGE_SOURCE]: ({ commit }, source: string) => {
    commit(MUTATION_TYPES.CHANGE_SOURCE, source)
  },
  [ACTION_TYPES.UPDATE_PROTOCOL]: ({ commit }, protocol: string) => {
    commit(MUTATION_TYPES.UPDATE_PROTOCOL, protocol)
  },
  [ACTION_TYPES.UPDATE_HOST]: ({ commit }, host: string) => {
    commit(MUTATION_TYPES.UPDATE_HOST, host)
  },
  [ACTION_TYPES.UPDATE_PORT]: ({ commit }, port: string) => {
    commit(MUTATION_TYPES.UPDATE_PORT, port)
  },
  [ACTION_TYPES.UPDATE_USERNAME]: ({ commit }, username: string) => {
    commit(MUTATION_TYPES.UPDATE_USERNAME, username)
  },
  [ACTION_TYPES.UPDATE_PASSWORD]: ({ commit }, password: string) => {
    commit(MUTATION_TYPES.UPDATE_PASSWORD, password)
  },
  [ACTION_TYPES.SAVE_PROXY_CONFIG]: async ({ state }) => {
    const proxy: Proxy = {
      source: state.source,
      manualProxyConfig: state.proxy
    }
    // Originally we have to restart all streamings after user change proxy configuration.
    // But streamings are restart after close preferences.
    // So we don't have to restart streaming here.
    // And we have to update webContents session, but it is care in main process.
    await win.ipcRenderer.invoke('update-proxy-config', proxy)
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
