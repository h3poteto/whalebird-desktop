import { Response, List } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Index, { IndexState } from '@/store/TimelineSpace/Contents/Lists/Index'

jest.mock('megalodon')

const list: List = {
  id: '1',
  title: 'list1'
}

let state = (): IndexState => {
  return {
    lists: []
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Index.actions,
    mutations: Index.mutations
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

describe('Lists/Index', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Index: initStore(),
        TimelineSpace: timelineState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<Array<List>>>(resolve => {
            const res: Response<Array<List>> = {
              data: [list],
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('Index/fetchLists')
      expect(store.state.Index.lists).toEqual([list])
    })
  })

  describe('createList', () => {
    it('should be created', async () => {
      const mockClient = {
        post: (_path: string, _params: object) => {
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
      const res: List = await store.dispatch('Index/createList', 'list1')
      expect(res.title).toEqual('list1')
    })
  })
})
