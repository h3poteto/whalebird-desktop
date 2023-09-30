import { RootState } from '@/store'
import { Response, Entity } from 'megalodon'
import { createStore, Store } from 'vuex'
import HeaderMenu, { HeaderMenuState } from '~/src/renderer/store/TimelineSpace/HeaderMenu'

const list: Entity.List = {
  id: '1',
  title: 'example',
  replies_policy: null
}

const mockClient = {
  getList: (_listID: string) => {
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

const timelineStore = () => ({
  namespaced: true,
  state: {
    account: {
      accessToken: 'token'
    },
    server: {
      sns: 'mastodon',
      baseURL: 'http://localhost'
    }
  },
  modules: {
    HeaderMenu: initStore()
  }
})

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('HeaderMenu', () => {
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
      const l = await store.dispatch('TimelineSpace/HeaderMenu/fetchList', list.id)
      expect(l).toEqual(list)
      expect(store.state.TimelineSpace.HeaderMenu.title).toEqual(`#${list.title}`)
    })
  })
})
