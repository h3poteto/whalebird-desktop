import Mastodon, { Emoji, Instance, Response } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import TimelineSpace, { TimelineSpaceState, blankAccount } from '~/src/renderer/store/TimelineSpace'
import unreadSettings from '~/src/constants/unreadNotification'

jest.mock('megalodon')

const mockedInstance: Instance = {
  uri: 'http://pleroma.io',
  title: 'pleroma',
  description: '',
  email: 'test@example.com',
  version: '2.5.0 (compatible; Pleroma 0.9.0-3363-g7c5d2dc7)',
  thumbnail: null,
  urls: {
    streaming_api: 'wss://pleroma.io'
  },
  stats: {
    user_count: 10,
    status_count: 1000,
    domain_count: 100
  },
  languages: ['en'],
  contact_account: null,
  max_toot_chars: 5000
}

const state = (): TimelineSpaceState => {
  return {
    account: blankAccount,
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

const MentionStore = {
  namespaced: true,
  actions: {
    fetchMentions: jest.fn()
  }
}

const contentsStore = {
  namespaced: true,
  modules: {
    Home: homeStore,
    Notifications: notificationStore,
    DirectMessages: DMStore,
    Local: LocalStore,
    Public: PublicStore,
    Mentions: MentionStore
  },
  actions: {
    changeLoading: jest.fn()
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
        ipcMain.once('get-local-account', (event: any) => {
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
        ipcMain.once('get-local-account', (event: any) => {
          event.sender.send('response-get-local-account', {})
        })
        ipcMain.once('update-account', (event: any) => {
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
      let mockedResponse: Response<Instance>
      beforeEach(() => {
        mockedResponse = {
          data: mockedInstance,
          status: 200,
          statusText: 'OK',
          headers: {}
        }
      })
      it('should be detected', async () => {
        ;(Mastodon.get as any).mockResolvedValue(mockedResponse)
        await store.dispatch('TimelineSpace/detectPleroma')
        expect(store.state.TimelineSpace.pleroma).toEqual(true)
        expect(store.state.TimelineSpace.useWebsocket).toEqual(true)
      })
    })
    describe('API is not pleroma', () => {
      let mockedResponse: Response<Instance>
      beforeEach(() => {
        const instance: Instance = {
          uri: 'http://mstdn.io',
          title: 'mstnd.io',
          description: '',
          email: 'test@example.com',
          version: '2.7.0',
          thumbnail: null,
          urls: {
            streaming_api: 'wss://mstdn.io'
          },
          stats: {
            user_count: 10,
            status_count: 1000,
            domain_count: 100
          },
          languages: ['en'],
          contact_account: null
        }
        mockedResponse = {
          data: instance,
          status: 200,
          statusText: 'OK',
          headers: {}
        }
      })
      it('should be detected', async () => {
        ;(Mastodon.get as any).mockResolvedValue(mockedResponse)
        await store.dispatch('TimelineSpace/detectPleroma')
        expect(store.state.TimelineSpace.pleroma).toEqual(false)
        expect(store.state.TimelineSpace.useWebsocket).toEqual(false)
      })
    })
  })

  describe('fetchEmojis', () => {
    let emacsEmoji: Emoji
    let rubyEmoji: Emoji
    let mockedResponse: Response<Array<Emoji>>
    beforeEach(() => {
      emacsEmoji = {
        shortcode: 'emacs',
        url: 'http://example.com/emacs',
        static_url: 'http://example.com/emacs',
        visible_in_picker: true
      }
      rubyEmoji = {
        shortcode: 'ruby',
        url: 'http://example.com/ruby',
        static_url: 'http://example.com/ruby',
        visible_in_picker: true
      }
      mockedResponse = {
        data: [emacsEmoji, rubyEmoji],
        status: 200,
        statusText: 'OK',
        headers: {}
      }
    })
    it('should be updated', async () => {
      ;(Mastodon.get as any).mockResolvedValue(mockedResponse)
      await store.dispatch('TimelineSpace/fetchEmojis', {})
      expect(store.state.TimelineSpace.emojis).toEqual([
        {
          image: 'http://example.com/emacs',
          name: ':emacs:'
        },
        {
          image: 'http://example.com/ruby',
          name: ':ruby:'
        }
      ])
    })
  })

  describe('fetchInstance', () => {
    let mockedResponse: Response<Instance>
    beforeEach(() => {
      mockedResponse = {
        data: mockedInstance,
        status: 200,
        statusText: 'OK',
        headers: {}
      }
    })
    it('should be updated', async () => {
      ;(Mastodon.get as any).mockResolvedValue(mockedResponse)
      await store.dispatch('TimelineSpace/fetchInstance', {})
      expect(store.state.TimelineSpace.tootMax).toEqual(5000)
    })
  })

  describe('loadUnreadNotification', () => {
    describe('success', () => {
      it('should be updated', async () => {
        ipcMain.once('get-unread-notification', (event: any) => {
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
        ipcMain.once('get-unread-notification', (event: any) => {
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
