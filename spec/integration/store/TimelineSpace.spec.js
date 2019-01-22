import Mastodon from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import TimelineSpace from '~/src/renderer/store/TimelineSpace'
import unreadSettings from '~/src/constants/unreadNotification'

jest.genMockFromModule('megalodon')
jest.mock('megalodon')

const state = () => {
  return {
    account: {
      domain: '',
      _id: '',
      username: ''
    },
    loading: false,
    emojis: [],
    tootMax: 500,
    unreadNotification: {
      direct: true,
      local: true,
      public: true
    },
    useWebsocket: false,
    pleroma: false
  }
}

const homeStore = {
  namespaced: true,
  actions: {
    fetchTimeline: jest.fn()
  }
}

const notificationStore = {
  namespaced: true,
  actions: {
    fetchNotifications: jest.fn()
  }
}

const DMStore = {
  namespaced: true,
  actions: {
    fetchTimeline: jest.fn()
  }
}

const LocalStore = {
  namespaced: true,
  actions: {
    fetchLocalTimeline: jest.fn()
  }
}

const PublicStore = {
  namespaced: true,
  actions: {
    fetchPublicTimeline: jest.fn()
  }
}

const contentsStore = {
  namespaced: true,
  modules: {
    Home: homeStore,
    Notifications: notificationStore,
    DirectMessages: DMStore,
    Local: LocalStore,
    Public: PublicStore
  }
}

const initStore = () => {
  return {
    namespaced: true,
    modules: {
      Contents: contentsStore
    },
    state: state(),
    actions: TimelineSpace.actions,
    mutations: TimelineSpace.mutations
  }
}

describe('TimelineSpace', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        TimelineSpace: initStore()
      }
    })
  })

  describe('localAccount', () => {
    describe('account already exists', () => {
      beforeEach(() => {
        ipcMain.once('get-local-account', (event, _id) => {
          event.sender.send('response-get-local-account', {
            username: 'test'
          })
        })
      })
      it('should be updated', async () => {
        await store.dispatch('TimelineSpace/localAccount', 1)
        expect(store.state.TimelineSpace.account.username).toEqual('test')
      })
    })

    describe('account does not exist', () => {
      beforeEach(() => {
        ipcMain.once('get-local-account', (event, _id) => {
          event.sender.send('response-get-local-account', {})
        })
        ipcMain.once('update-account', (event, _account) => {
          event.sender.send('response-update-account', {
            username: 'fetched'
          })
        })
      })
      it('should be fetched', async () => {
        await store.dispatch('TimelineSpace/localAccount', 1)
        expect(store.state.TimelineSpace.account.username).toEqual('fetched')
      })
    })
  })

  describe('detectPleroma', () => {
    describe('API is pleroma', () => {
      it('should be detected', async () => {
        const mockResponse = {
          version: 'Pleroma v0.9.9'
        }
        Mastodon.get.mockResolvedValue(mockResponse)
        await store.dispatch('TimelineSpace/detectPleroma')
        expect(store.state.TimelineSpace.pleroma).toEqual(true)
        expect(store.state.TimelineSpace.useWebsocket).toEqual(true)
      })
    })
    describe('API is not pleroma', () => {
      it('should be detected', async () => {
        const mockResponse = {
          version: '2.7.0'
        }
        Mastodon.get.mockResolvedValue(mockResponse)
        await store.dispatch('TimelineSpace/detectPleroma')
        expect(store.state.TimelineSpace.pleroma).toEqual(false)
        expect(store.state.TimelineSpace.useWebsocket).toEqual(false)
      })
    })
  })

  describe('fetchEmojis', () => {
    it('should be updated', async () => {
      const mockResponse = [
        {
          shortcode: 'emacs',
          url: 'http://example.com/emacs'
        },
        {
          shortcode: 'ruby',
          url: 'http://example.com/ruby'
        }
      ]
      Mastodon.get.mockResolvedValue(mockResponse)
      await store.dispatch('TimelineSpace/fetchEmojis', {})
      expect(store.state.TimelineSpace.emojis).toEqual([
        {
          name: ':emacs:',
          image: 'http://example.com/emacs'
        },
        {
          name: ':ruby:',
          image: 'http://example.com/ruby'
        }
      ])
    })
  })

  describe('fetchInstance', () => {
    it('should be updated', async () => {
      const mockResponse = {
        max_toot_chars: 5000
      }
      Mastodon.get.mockResolvedValue(mockResponse)
      await store.dispatch('TimelineSpace/fetchInstance', {})
      expect(store.state.TimelineSpace.tootMax).toEqual(5000)
    })
  })

  describe('loadUnreadNotification', () => {
    describe('success', () => {
      it('should be updated', async () => {
        ipcMain.once('get-unread-notification', (event, _) => {
          event.sender.send('response-get-unread-notification', {
            direct: false,
            local: false,
            public: false
          })
        })
        await store.dispatch('TimelineSpace/loadUnreadNotification')
        expect(store.state.TimelineSpace.unreadNotification).toEqual({
          direct: false,
          local: false,
          public: false
        })
      })
    })
    describe('error', () => {
      it('should be set default', async () => {
        ipcMain.once('get-unread-notification', (event, _) => {
          event.sender.send('error-get-unread-notification', new Error())
        })
        await store.dispatch('TimelineSpace/loadUnreadNotification')
        expect(store.state.TimelineSpace.unreadNotification).toEqual({
          direct: unreadSettings.Direct.default,
          local: unreadSettings.Local.default,
          public: unreadSettings.Public.default
        })
      })
    })
  })

  describe('fetchContentsTimelines', () => {
    it('should be called', async () => {
      await store.dispatch('TimelineSpace/fetchContentsTimelines', {})
      expect(homeStore.actions.fetchTimeline).toHaveBeenCalled()
      expect(notificationStore.actions.fetchNotifications).toHaveBeenCalled()
      expect(DMStore.actions.fetchTimeline).toHaveBeenCalled()
      expect(LocalStore.actions.fetchLocalTimeline).toHaveBeenCalled()
      expect(PublicStore.actions.fetchPublicTimeline).toHaveBeenCalled()
    })
  })
})
