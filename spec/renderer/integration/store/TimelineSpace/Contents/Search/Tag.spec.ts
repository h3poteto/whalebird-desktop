import { Response, Entity } from 'megalodon'
import { createStore, Store } from 'vuex'
import TagStore, { TagState } from '@/store/TimelineSpace/Contents/Search/Tag'
import { RootState } from '@/store'

const tag1: Entity.Tag = {
  name: 'tag1',
  url: 'http://example.com/tag1',
  history: null
}

const mockClient = {
  search: () => {
    return new Promise<Response<Entity.Results>>(resolve => {
      const res: Response<Entity.Results> = {
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

jest.mock('megalodon', () => ({
  ...jest.requireActual<object>('megalodon'),
  default: jest.fn(() => mockClient),
  __esModule: true
}))

const state = (): TagState => {
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

const searchStore = () => ({
  namespaced: true,
  modules: {
    Tag: initStore()
  }
})

const contentsStore = () => ({
  namespaced: true,
  state: {},
  mutations: {
    changeLoading: jest.fn()
  },
  actions: {},
  modules: {
    Search: searchStore()
  }
})

const timelineStore = () => ({
  namespaced: true,
  modules: {
    Contents: contentsStore()
  },
  state: {
    account: {
      accessToken: 'token',
      baseURL: 'http://localhost'
    },
    sns: 'mastodon'
  }
})

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('Search/Tag', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        TimelineSpace: timelineStore(),
        App: appState
      }
    })
  })

  describe('search', () => {
    it('should be updated', async () => {
      await store.dispatch('TimelineSpace/Contents/Search/Tag/search', 'query')
      expect(store.state.TimelineSpace.Contents.Search.Tag.results).toEqual([tag1])
    })
  })
})
