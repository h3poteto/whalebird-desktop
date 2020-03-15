import { Response, Entity } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Mentions from '~/src/renderer/store/TimelineSpace/Contents/Mentions'

const mockClient = {
  getNotifications: () => {
    return new Promise<Response<Entity.Notification[]>>(resolve => {
      const res: Response<Entity.Notification[]> = {
        data: [mention, reblog, favourite, follow],
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

const account: Entity.Account = {
  id: '1',
  username: 'h3poteto',
  acct: 'h3poteto@pleroma.io',
  display_name: 'h3poteto',
  locked: false,
  created_at: '2019-03-26T21:30:32',
  followers_count: 10,
  following_count: 10,
  statuses_count: 100,
  note: 'engineer',
  url: 'https://pleroma.io',
  avatar: '',
  avatar_static: '',
  header: '',
  header_static: '',
  emojis: [],
  moved: null,
  fields: null,
  bot: false
}

const status: Entity.Status = {
  id: '1',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'hoge',
  created_at: '2019-03-26T21:40:32',
  emojis: [],
  replies_count: 0,
  reblogs_count: 0,
  favourites_count: 0,
  reblogged: null,
  favourited: null,
  muted: null,
  sensitive: false,
  spoiler_text: '',
  visibility: 'public',
  media_attachments: [],
  mentions: [],
  tags: [],
  card: null,
  poll: null,
  application: {
    name: 'Web'
  } as Entity.Application,
  language: null,
  pinned: null
}

const mention: Entity.Notification = {
  account: account,
  created_at: '2019-03-26T21:40:32',
  id: '1',
  status: status,
  type: 'mention'
}

const reblog: Entity.Notification = {
  account: account,
  created_at: '2019-03-26T21:40:32',
  id: '2',
  status: status,
  type: 'reblog'
}

const favourite: Entity.Notification = {
  account: account,
  created_at: '2019-03-26T21:40:32',
  id: '3',
  status: status,
  type: 'favourite'
}

const follow: Entity.Notification = {
  account: account,
  created_at: '2019-03-26T21:40:32',
  id: '4',
  type: 'follow'
}

let state: Function = () => {
  return {
    lazyLoading: false,
    heading: true,
    mentions: [],
    unreadMentions: [],
    filter: ''
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Mentions.actions,
    mutations: Mentions.mutations,
    getters: Mentions.getters
  }
}
const timelineState = {
  namespaced: true,
  state: {
    account: {
      accessToken: 'token',
      baseURL: 'http://localhost'
    }
  }
}

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('Mentions', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Mentions: initStore(),
        TimelineSpace: timelineState,
        App: appState
      }
    })
  })

  describe('fetchMentions', () => {
    it('should be updated', async () => {
      await store.dispatch('Mentions/fetchMentions')
      expect(store.state.Mentions.mentions).toEqual([mention, reblog, favourite, follow])
    })
  })

  describe('lazyFetchMentions', () => {
    describe('loading', () => {
      beforeAll(() => {
        state = () => {
          return {
            lazyLoading: true,
            heading: true,
            mentions: [],
            unreadMentions: [],
            filter: ''
          }
        }
      })
      it('should not be updated', async () => {
        const result = await store.dispatch('Mentions/lazyFetchMentions', {})
        expect(result).toEqual(null)
      })
    })

    describe('success', () => {
      beforeAll(() => {
        state = () => {
          return {
            lazyLoading: false,
            heading: true,
            mentions: [mention, reblog],
            unreadMentions: [],
            filter: ''
          }
        }
      })
      it('should be updated', async () => {
        mockClient.getNotifications = () => {
          return new Promise<Response<Entity.Notification[]>>(resolve => {
            const res: Response<Entity.Notification[]> = {
              data: [favourite, follow],
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }

        await store.dispatch('Mentions/lazyFetchMentions', { id: 1 })
        expect(store.state.Mentions.mentions).toEqual([mention, reblog, favourite, follow])
        expect(store.state.Mentions.lazyLoading).toEqual(false)
      })
    })
  })

  describe('mentions', () => {
    beforeAll(() => {
      state = () => {
        return {
          lazyLoading: false,
          heading: true,
          mentions: [mention, favourite, reblog, follow],
          unreadMentions: [],
          filter: ''
        }
      }
    })
    it('should return only mentions', () => {
      const mentions = store.getters['Mentions/mentions']
      expect(mentions).toEqual([mention])
    })
  })
})
