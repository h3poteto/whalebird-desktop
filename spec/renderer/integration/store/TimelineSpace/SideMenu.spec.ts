import { Entity, Response } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import SideMenu, { SideMenuState } from '~/src/renderer/store/TimelineSpace/SideMenu'
import { LocalTag } from '~/src/types/localTag'
import { MyWindow } from '~/src/types/global'
;(window as MyWindow).ipcRenderer = ipcRenderer

const mockClient = {
  getLists: () => {
    return new Promise<Response<Entity.List[]>>(resolve => {
      const res: Response<Entity.List[]> = {
        data: [list1, list2],
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

// import mockedMegalodon from '~/spec/mock/megalodon'

const list1: Entity.List = {
  id: '1',
  title: 'example1'
}

const list2: Entity.List = {
  id: '2',
  title: 'example2'
}

const state = (): SideMenuState => {
  return {
    unreadHomeTimeline: false,
    unreadNotifications: false,
    unreadMentions: false,
    unreadLocalTimeline: false,
    unreadDirectMessagesTimeline: false,
    unreadPublicTimeline: false,
    unreadFollowRequests: false,
    lists: [],
    tags: [],
    collapse: false
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: SideMenu.actions,
    mutations: SideMenu.mutations
  }
}

const appStore = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

const timelineStore = {
  namespaced: true,
  state: {
    sns: 'mastodon'
  }
}

describe('SideMenu', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        SideMenu: initStore(),
        App: appStore,
        TimelineSpace: timelineStore
      }
    })
    // mockedMegalodon.mockClear()
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      // mockedMegalodon.mockImplementation(() => mockClient)
      const account = {
        accessToken: 'token',
        baseURL: 'http://localhost'
      }
      const lists = await store.dispatch('SideMenu/fetchLists', account)
      expect(store.state.SideMenu.lists).toEqual([list1, list2])
      expect(lists).toEqual([list1, list2])
    })
  })

  describe('clearUnread', () => {
    it('should be resetted', () => {
      store.dispatch('SideMenu/clearUnread')
      expect(store.state.SideMenu.unreadHomeTimeline).toEqual(false)
      expect(store.state.SideMenu.unreadNotifications).toEqual(false)
      expect(store.state.SideMenu.unreadLocalTimeline).toEqual(false)
      expect(store.state.SideMenu.unreadDirectMessagesTimeline).toEqual(false)
      expect(store.state.SideMenu.unreadPublicTimeline).toEqual(false)
    })
  })

  describe('changeCollapse', () => {
    it('should be changed', () => {
      store.dispatch('SideMenu/changeCollapse', true)
      expect(store.state.SideMenu.collapse).toEqual(true)
    })
  })

  describe('readCollapse', () => {
    it('should be read', async () => {
      ipcMain.once('get-collapse', (event: any, _) => {
        event.sender.send('response-get-collapse', true)
      })
      await store.dispatch('SideMenu/readCollapse')
      expect(store.state.SideMenu.collapse).toEqual(true)
    })
  })

  describe('listTags', () => {
    it('should be listed', async () => {
      const tag1: LocalTag = {
        tagName: 'tag1'
      }
      const tag2: LocalTag = {
        tagName: 'tag2'
      }
      ipcMain.once('list-hashtags', (event: any, _) => {
        event.sender.send('response-list-hashtags', [tag1, tag2])
      })
      await store.dispatch('SideMenu/listTags')
      expect(store.state.SideMenu.tags).toEqual([tag1, tag2])
    })
  })
})
