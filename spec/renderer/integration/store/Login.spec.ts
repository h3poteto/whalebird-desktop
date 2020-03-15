import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import Login, { LoginState } from '@/store/Login'
import { MyWindow } from '~/src/types/global'
;(window as MyWindow).ipcRenderer = ipcRenderer

jest.mock('megalodon', () => ({
  ...jest.requireActual('megalodon'),
  detector: jest.fn(() => 'pleroma'),
  __esModule: true
}))

const state = (): LoginState => {
  return {
    selectedInstance: null,
    searching: false
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
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Login: initStore(),
        App: appState
      }
    })
  })

  describe('fetchLogin', () => {
    describe('error', () => {
      it('should return error', async () => {
        ipcMain.once('get-auth-url', event => {
          event.sender.send('error-get-auth-url', new Error())
        })
        await store.dispatch('Login/fetchLogin', 'pleroma.io').catch((err: Error) => {
          expect(err instanceof Error).toEqual(true)
        })
      })
    })
    describe('success', () => {
      it('should return url', async () => {
        ipcMain.once('get-auth-url', event => {
          event.sender.send('response-get-auth-url', 'http://example.com/auth')
        })
        const url = await store.dispatch('Login/fetchLogin', 'pleroma.io')
        expect(url).toEqual('http://example.com/auth')
      })
    })
  })

  describe('pageBack', () => {
    it('should reset instance', () => {
      store.dispatch('Login/pageBack')
      expect(store.state.Login.selectedInstance).toEqual(null)
    })
  })

  describe('confirmInstance', () => {
    it('should change instance', async () => {
      const result = await store.dispatch('Login/confirmInstance', 'pleroma.io')
      expect(result).toEqual(true)
      expect(store.state.Login.selectedInstance).toEqual('pleroma.io')
    })
  })
})
