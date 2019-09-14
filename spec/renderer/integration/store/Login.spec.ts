import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import axios from 'axios'
import Login, { LoginState } from '@/store/Login'

jest.mock('axios')

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

describe('Login', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Login: initStore()
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
      // Provide Promise.resolve for finally keywrod.
      // https://github.com/facebook/jest/issues/6552
      // https://github.com/kulshekhar/ts-jest/issues/828
      const mockedAxios = axios as any
      const res: Promise<{}> = new Promise<{}>(resolve => {
        resolve({
          data:
            '<?xml version="1.0" encoding="UTF-8"?><XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0"><Link rel="lrdd" template="https://pleroma.io/.well-known/webfinger?resource={uri}" type="application/xrd+xml" /></XRD>'
        })
      })
      mockedAxios.get.mockImplementation(() => res)
      const result = await store.dispatch('Login/confirmInstance', 'pleroma.io')
      expect(result).toEqual(true)
      expect(store.state.Login.selectedInstance).toEqual('pleroma.io')
    })
  })
})
