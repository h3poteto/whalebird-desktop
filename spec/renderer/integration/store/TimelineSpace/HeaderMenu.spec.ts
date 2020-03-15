import { Response, Entity } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import HeaderMenu, { HeaderMenuState } from '~/src/renderer/store/TimelineSpace/HeaderMenu'

const list: Entity.List = {
  id: '1',
  title: 'example'
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
  ...jest.requireActual('megalodon'),
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

describe('HeaderMenu', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        HeaderMenu: initStore(),
        TimelineSpace: timelineState,
        App: appState
      }
    })
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      const l = await store.dispatch('HeaderMenu/fetchList', list.id)
      expect(l).toEqual(list)
      expect(store.state.HeaderMenu.title).toEqual(`#${list.title}`)
    })
  })
})
