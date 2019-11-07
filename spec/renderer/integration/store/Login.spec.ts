import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import Mastodon, { Instance, Response } from 'megalodon'
import Login, { LoginState } from '@/store/Login'

jest.mock('megalodon')

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
      // Provide Promise.resolve for finally keywrod.
      // https://github.com/facebook/jest/issues/6552
      // https://github.com/kulshekhar/ts-jest/issues/828
      const mockedClient = Mastodon as any
      const instance: Promise<Response<Instance>> = new Promise<Response<Instance>>(resolve => {
        const res: Response<Instance> = {
          data: {
            uri: 'http://example.com',
            title: 'test-mastodon',
            description: 'description',
            email: 'hoge@example.com',
            version: '1.0.0',
            thumbnail: null,
            urls: {
              streaming_api: 'http://example.com'
            },
            stats: {
              user_count: 1,
              status_count: 10,
              domain_count: 10
            },
            languages: ['en'],
            contact_account: null
          } as Instance,
          status: 200,
          statusText: '200',
          headers: null
        }
        resolve(res)
      })
      mockedClient.get.mockImplementation(() => instance)
      const result = await store.dispatch('Login/confirmInstance', 'pleroma.io')
      expect(result).toEqual(true)
      expect(store.state.Login.selectedInstance).toEqual('pleroma.io')
    })

    it('should failover host-meta', async () => {
      const mockedClient = Mastodon as any
      // @ts-ignore
      const instance: Promise<any> = new Promise<any>((resolve, reject) => {
        const err = new Error('err')
        reject(err)
      })
      const hostMeta: Promise<{}> = new Promise<{}>(resolve => {
        resolve({
          data:
            '<?xml version="1.0" encoding="UTF-8"?><XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0"><Link rel="lrdd" template="https://pleroma.io/.well-known/webfinger?resource={uri}" type="application/xrd+xml" /></XRD>'
        })
      })
      mockedClient.get.mockImplementationOnce(() => instance).mockImplementationOnce(() => hostMeta)
      const result = await store.dispatch('Login/confirmInstance', 'pleroma.io')
      expect(result).toEqual(true)
      expect(store.state.Login.selectedInstance).toEqual('pleroma.io')
    })
  })
})
