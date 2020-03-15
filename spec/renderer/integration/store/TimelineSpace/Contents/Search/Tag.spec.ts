import { Response, Entity } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import TagStore, { TagState } from '@/store/TimelineSpace/Contents/Search/Tag'

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
  ...jest.requireActual('megalodon'),
  default: jest.fn(() => mockClient),
  __esModule: true
}))

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
    },
    sns: 'mastodon'
  }
}
const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('Search/Tag', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Tag: initStore(),
        TimelineSpace: timelineState,
        App: appState
      }
    })
  })

  describe('search', () => {
    it('should be updated', async () => {
      await store.dispatch('Tag/search', 'query')
      expect(store.state.Tag.results).toEqual([tag1])
    })
  })
})
