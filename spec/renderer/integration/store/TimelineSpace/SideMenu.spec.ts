import { Entity, Response } from 'megalodon'
import { createStore, Store } from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import SideMenu, { SideMenuState } from '~/src/renderer/store/TimelineSpace/SideMenu'
import { LocalTag } from '~/src/types/localTag'
import { MyWindow } from '~/src/types/global'
import { RootState } from '@/store'
;(window as any as MyWindow).ipcRenderer = ipcRenderer

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
  ...jest.requireActual<object>('megalodon'),
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
    collapse: false,
    enabledTimelines: {
      home: true,
      notification: true,
      mention: true,
      direct: true,
      favourite: true,
      bookmark: true,
      local: true,
      public: true,
      tag: true,
      list: true
    }
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

const timelineStore = () => ({
  namespaced: true,
  state: {
    sns: 'mastodon'
  },
  modules: {
    SideMenu: initStore()
  }
})

describe('SideMenu', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        App: appStore,
        TimelineSpace: timelineStore()
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
      const lists = await store.dispatch('TimelineSpace/SideMenu/fetchLists', account)
      expect(store.state.TimelineSpace.SideMenu.lists).toEqual([list1, list2])
      expect(lists).toEqual([list1, list2])
    })
  })

  describe('clearUnread', () => {
    it('should be reset', () => {
      store.dispatch('TimelineSpace/SideMenu/clearUnread')
      expect(store.state.TimelineSpace.SideMenu.unreadHomeTimeline).toEqual(false)
      expect(store.state.TimelineSpace.SideMenu.unreadNotifications).toEqual(false)
      expect(store.state.TimelineSpace.SideMenu.unreadLocalTimeline).toEqual(false)
      expect(store.state.TimelineSpace.SideMenu.unreadDirectMessagesTimeline).toEqual(false)
      expect(store.state.TimelineSpace.SideMenu.unreadPublicTimeline).toEqual(false)
    })
  })

  describe('changeCollapse', () => {
    it('should be changed', () => {
      store.dispatch('TimelineSpace/SideMenu/changeCollapse', true)
      expect(store.state.TimelineSpace.SideMenu.collapse).toEqual(true)
    })
  })

  describe('readCollapse', () => {
    it('should be read', async () => {
      ipcMain.handle('get-collapse', () => {
        return true
      })
      await store.dispatch('TimelineSpace/SideMenu/readCollapse')
      expect(store.state.TimelineSpace.SideMenu.collapse).toEqual(true)
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
      ipcMain.handle('list-hashtags', () => {
        return [tag1, tag2]
      })
      await store.dispatch('TimelineSpace/SideMenu/listTags')
      expect(store.state.TimelineSpace.SideMenu.tags).toEqual([tag1, tag2])
    })
  })
})
