import { createStore, Store } from 'vuex'
import { ipcRenderer } from '~/spec/mock/electron'
import Login, { LoginState } from '@/store/Login'
import { MyWindow } from '~/src/types/global'
import { RootState } from '@/store'
;((window as any) as MyWindow).ipcRenderer = ipcRenderer

jest.mock('megalodon', () => ({
  ...jest.requireActual<object>('megalodon'),
  detector: jest.fn(() => 'pleroma'),
  __esModule: true
}))

const state = (): LoginState => {
  return {
    domain: null,
    searching: false,
    server: null,
    appData: null,
    sns: 'mastodon'
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Login.actions,
    mutations: Login.mutations
  }
}

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('Login', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        Login: initStore(),
        App: appState
      }
    })
  })

  describe('pageBack', () => {
    it('should reset instance', () => {
      store.dispatch('Login/pageBack')
      expect(store.state.Login.domain).toEqual(null)
    })
  })

  describe('confirmInstance', () => {
    it('should change instance', async () => {
      const result = await store.dispatch('Login/confirmInstance', 'pleroma.io')
      expect(result).toEqual(true)
      expect(store.state.Login.domain).toEqual('pleroma.io')
    })
  })
})
