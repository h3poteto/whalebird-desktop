import axios from 'axios'
import Login from '@/store/Login'
import { ipcRenderer } from '~/spec/mock/electron'

jest.mock('axios')

describe('Login', () => {
  describe('mutations', () => {
    let state
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

  describe('actions', () => {
    let state
    beforeEach(() => {
      state = {
        instances: [],
        selectedInstance: null,
        searching: false
      }
    })
    describe('fetchLogin', async () => {
      const commitMock = jest.fn()
      const url = await Login.actions.fetchLogin({ commit: commitMock }, 'pleroma.io')
      expect(ipcRenderer.send).toHaveBeenCalledWith('get-auth-url', 'pleroma.io')
    })
    describe('pageBack', () => {
      const commitMock = jest.fn()
      Login.actions.pageBack({ commit: commitMock })
      expect(commitMock).toHaveBeenCalledWith('changeInstance', null)
    })
    describe('confirmInstance', async () => {
      const resp = {
        data: 'test'
      }
      // Provide Promise.resolve for finally keywrod.
      // https://github.com/facebook/jest/issues/6552
      axios.get.mockReturnValue(Promise.resolve(resp))
      const commitMock = jest.fn()
      const data = await Login.actions.confirmInstance({ commit: commitMock }, 'pleroma.io')
      expect(data).toEqual('test')
      // ref: https://eddyerburgh.me/how-to-unit-test-a-vuex-store
      expect(commitMock).toHaveBeenCalledWith('changeInstance', 'pleroma.io')
    })
  })
})
