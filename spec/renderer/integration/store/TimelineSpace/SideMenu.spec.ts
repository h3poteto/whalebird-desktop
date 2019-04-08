import { Response, List } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import SideMenu, { SideMenuState } from '~/src/renderer/store/TimelineSpace/SideMenu'
import Hashtag from '~/src/types/hashtag'

jest.mock('megalodon')

const list1: List = {
  id: 1,
  title: 'example1'
}

const list2: List = {
  id: 2,
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

describe('SideMenu', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        SideMenu: initStore()
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<List[]>>(resolve => {
            const res: Response<List[]> = {
              data: [
                list1,
                list2
              ],
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
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
      const tag1: Hashtag = {
        tagName: 'tag1'
      }
      const tag2: Hashtag = {
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
