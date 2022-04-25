import { Response, Entity } from 'megalodon'
import { createStore, Store } from 'vuex'
import Index, { IndexState } from '@/store/TimelineSpace/Contents/Lists/Index'
import { RootState } from '@/store'

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
  ...jest.requireActual<object>('megalodon'),
  default: jest.fn(() => mockClient),
  __esModule: true
}))

const list: Entity.List = {
  id: '1',
  title: 'list1'
}

const state = (): IndexState => {
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

const listsStore = () => ({
  namespaced: true,
  modules: {
    Index: initStore()
  }
})

const contentsStore = () => ({
  namespaced: true,
  modules: {
    Lists: listsStore()
  }
})

const timelineStore = () => ({
  namespaced: true,
  state: {
    account: {
      accessToken: 'token',
      baseURL: 'http://localhost'
    },
    sns: 'mastodon'
  },
  modules: {
    Contents: contentsStore()
  }
})

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('Lists/Index', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        TimelineSpace: timelineStore(),
        App: appState
      }
    })
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      await store.dispatch('TimelineSpace/Contents/Lists/Index/fetchLists')
      expect(store.state.TimelineSpace.Contents.Lists.Index.lists).toEqual([list])
    })
  })

  describe('createList', () => {
    it('should be created', async () => {
      const res: Entity.List = await store.dispatch('TimelineSpace/Contents/Lists/Index/createList', 'list1')
      expect(res.title).toEqual('list1')
    })
  })
})
