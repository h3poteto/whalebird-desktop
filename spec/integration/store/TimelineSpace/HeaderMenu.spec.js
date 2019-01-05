import Mastodon from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import HeaderMenu from '~/src/renderer/store/TimelineSpace/HeaderMenu'

jest.genMockFromModule('megalodon')
jest.mock('megalodon')

const state = {
  title: 'Home',
  reload: false
}

const initState = {
  namespaced: true,
  state: state,
  actions: HeaderMenu.actions,
  mutations: HeaderMenu.mutations
}

const timelineState = {
  namespaced: true,
  state: {
    account: {
      accessToken: 'token',
      baseURL: 'http://localhost'
    }
  }
}

describe('HeaderMenu', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        HeaderMenu: initState,
        TimelineSpace: timelineState
      }
    })
    Mastodon.mockClear()
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: {
                title: 'list1'
              }
            })
          })
        }
      }

      Mastodon.mockImplementation(() => mockClient)
      const list = await store.dispatch('HeaderMenu/fetchList', 1)
      expect(list).toEqual({
        title: 'list1'
      })
      expect(store.state.HeaderMenu.title).toEqual('#list1')
    })
  })
})
