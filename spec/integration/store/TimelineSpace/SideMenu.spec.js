import Mastodon from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import SideMenu from '~/src/renderer/store/TimelineSpace/SideMenu'

jest.genMockFromModule('megalodon')
jest.mock('megalodon')

const state = {
  unreadHomeTimeline: false,
  unreadNotifications: false,
  unreadLocalTimeline: false,
  unreadDirectMessagesTimeline: false,
  unreadPublicTimeline: false,
  lists: [],
  tags: [],
  collapse: false
}

const initState = {
  namespaced: true,
  state: state,
  actions: SideMenu.actions,
  mutations: SideMenu.mutations
}

describe('SideMenu', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        SideMenu: initState
      }
    })
    Mastodon.mockClear()
  })

  describe('fetchLists', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: [
                'list1',
                'list2'
              ]
            })
          })
        }
      }

      Mastodon.mockImplementation(() => mockClient)
      const account = {
        accessToken: 'token',
        baseURL: 'http://localhost'
      }
      const lists = await store.dispatch('SideMenu/fetchLists', account)
      expect(store.state.SideMenu.lists).toEqual(['list1', 'list2'])
      expect(lists).toEqual(['list1', 'list2'])
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
      ipcMain.once('get-collapse', (event, _) => {
        event.sender.send('response-get-collapse', true)
      })
      await store.dispatch('SideMenu/readCollapse')
      expect(store.state.SideMenu.collapse).toEqual(true)
    })
  })

  describe('listTags', () => {
    it('should be listed', async () => {
      ipcMain.once('list-hashtags', (event, _) => {
        event.sender.send('response-list-hashtags', ['tag1', 'tag2'])
      })
      await store.dispatch('SideMenu/listTags')
      expect(store.state.SideMenu.tags).toEqual(['tag1', 'tag2'])
    })
  })
})
