import { Response, Results, Tag } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import TagStore, { TagState } from '@/store/TimelineSpace/Contents/Search/Tag'

jest.mock('megalodon')

const tag1: Tag = {
  name: 'tag1',
  url: 'http://example.com/tag1',
  history: null
}

let state = (): TagState => {
  return {
    results: []
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: TagStore.actions,
    mutations: TagStore.mutations
  }
}

const contentsStore = {
  namespaced: true,
  state: {},
  mutations: {
    changeLoading: jest.fn()
  },
  actions: {}
}

const timelineState = {
  namespaced: true,
  modules: {
    Contents: contentsStore
  },
  state: {
    account: {
      accessToken: 'token',
      baseURL: 'http://localhost'
    }
  }
}

describe('Search/Account', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Tag: initStore(),
        TimelineSpace: timelineState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('search', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<Results>>(resolve => {
            const res: Response<Results> = {
              data: {
                accounts: [],
                statuses: [],
                hashtags: [tag1]
              },
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('Tag/search', 'query')
      expect(store.state.Tag.results).toEqual([tag1])
    })
  })
})
