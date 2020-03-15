import { Response, Entity } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Index, { IndexState } from '@/store/TimelineSpace/Contents/Lists/Index'

const mockClient = {
  getLists: () => {
    return new Promise<Response<Array<Entity.List>>>(resolve => {
      const res: Response<Array<Entity.List>> = {
        data: [list],
        status: 200,
        statusText: 'OK',
        headers: {}
      }
      resolve(res)
    })
  },
  createList: () => {
    return new Promise<Response<Entity.List>>(resolve => {
      const res: Response<Entity.List> = {
        data: list,
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

const list: Entity.List = {
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

describe('Lists/Index', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Index: initStore(),
        TimelineSpace: timelineState,
        App: appState
      }
    })
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      await store.dispatch('Index/fetchLists')
      expect(store.state.Index.lists).toEqual([list])
    })
  })

  describe('createList', () => {
    it('should be created', async () => {
      const res: Entity.List = await store.dispatch('Index/createList', 'list1')
      expect(res.title).toEqual('list1')
    })
  })
})
