import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import axios, { AxiosStatic } from 'axios'
import Login from '@/store/Login'

jest.mock('axios')
interface AxiosMock extends AxiosStatic {
  mockResolvedValue: Function
  mockRejectedValue: Function
  mockImplementation: Function
}

const state = () => {
  return {
    instances: [],
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
        ipcMain.once('get-auth-url', (event, _) => {
          event.sender.send('error-get-auth-url', new Error())
        })
        await store.dispatch('Login/fetchLogin', 'pleroma.io')
          .catch((err: Error) => {
            expect(err instanceof Error).toEqual(true)
          })
      })
    })
    describe('success', () => {
      it('should return url', async () => {
        ipcMain.once('get-auth-url', (event, _) => {
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

  // TODO: Could not mock axios for finally
  describe.skip('confirmInstance', () => {
    it('should change instance', async () => {
      // Provide Promise.resolve for finally keywrod.
      // https://github.com/facebook/jest/issues/6552
      const mockedAxios = axios as AxiosMock
      const res: Promise<object> = new Promise<object>((resolve, _) => {
        resolve({
          data: 'test'
        })
      })
      mockedAxios.mockImplementation(() => res)
      const data = await store.dispatch('Login/confirmInstance', 'pleroma.io')
      expect(data).toEqual('test')
      expect(store.state.Login.selectedInstance).toEqual('pleroma.io')
    })
  })
})

