import { Response, List } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import HeaderMenu, { HeaderMenuState } from '~/src/renderer/store/TimelineSpace/HeaderMenu'

jest.mock('megalodon')

const list: List = {
  id: '1',
  title: 'example'
}

const state = (): HeaderMenuState => {
  return {
    title: 'Home',
    reload: false,
    loading: false
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: HeaderMenu.actions,
    mutations: HeaderMenu.mutations
  }
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
        HeaderMenu: initStore(),
        TimelineSpace: timelineState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<List>>(resolve => {
            const res: Response<List> = {
              data: list,
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      const l = await store.dispatch('HeaderMenu/fetchList', list.id)
      expect(l).toEqual(list)
      expect(store.state.HeaderMenu.title).toEqual(`#${list.title}`)
    })
  })
})
