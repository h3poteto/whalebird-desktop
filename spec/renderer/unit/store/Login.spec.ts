import Login from '@/store/Login'
import axios from 'axios'
import { ipcMain } from '~/spec/mock/electron'

jest.mock('axios')
axios.get = jest.fn()

describe('Login', () => {
  describe('mutations', () => {
    let state: any
    beforeEach(() => {
      state = {
        instances: [],
        selectedInstance: null,
        searching: false
      }
    })
    describe('changeInstance', () => {
      it('should be changed', () => {
        Login.mutations.changeInstance(state, 'pleroma.io')
        expect(state.selectedInstance).toEqual('pleroma.io')
      })
    })
    describe('changeSearching', () => {
      it('should be changed', () => {
        Login.mutations.changeSearching(state, true)
        expect(state.searching).toEqual(true)
      })
    })
  })

  // TODO: move to integration
  describe.skip('actions', () => {
    describe('fetchLogin', () => {
      describe('error', () => {
        it('should return error', async () => {
          ipcMain.once('get-auth-url', (event, _) => {
            event.sender.send('error-get-auth-url', new AuthError())
          })
          const commitMock = jest.fn()
          await Login.actions.fetchLogin({ commit: commitMock }, 'pleroma.io')
            .catch((err) => {
              expect(err instanceof AuthError).toEqual(true)
            })
        })
      })
      describe('success', () => {
        it('should return url', async () => {
          ipcMain.once('get-auth-url', (event, _) => {
            event.sender.send('response-get-auth-url', 'http://example.com/auth')
          })
          const commitMock = jest.fn()
          const url = await Login.actions.fetchLogin({ commit: commitMock }, 'pleroma.io')
          expect(url).toEqual('http://example.com/auth')
        })
      })
    })
    describe('pageBack', () => {
      it('should reset instance', () => {
        const commitMock = jest.fn()
        Login.actions.pageBack({ commit: commitMock })
        expect(commitMock).toHaveBeenCalledWith('changeInstance', null)
      })
    })
    describe('confirmInstance', () => {
      it('should change instance', async () => {
        // Provide Promise.resolve for finally keywrod.
        // https://github.com/facebook/jest/issues/6552
        (<jest.Mock>axios.get).mockReturnValue(Promise.resolve({
          data: 'test'
        }))
        const commitMock = jest.fn()
        const data = await Login.actions.confirmInstance({ commit: commitMock }, 'pleroma.io')
        expect(data).toEqual('test')
        // ref: https://eddyerburgh.me/how-to-unit-test-a-vuex-store
        expect(commitMock).toHaveBeenCalledWith('changeInstance', 'pleroma.io')
      })
    })
  })
})

class AuthError extends Error { }
