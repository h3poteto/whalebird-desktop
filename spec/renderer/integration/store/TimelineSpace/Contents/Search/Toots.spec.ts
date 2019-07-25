import { Response, Results, Status, Account, Application } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Toots, { TootsState } from '@/store/TimelineSpace/Contents/Search/Toots'

jest.mock('megalodon')

const account: Account = {
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

const status: Status = {
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
  } as Application,
  language: null,
  pinned: null
}

let state = (): TootsState => {
  return {
    results: []
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Toots.actions,
    mutations: Toots.mutations
  }
}

const contentsStore = {
  namespaced: true,
  state: {},
  mutations: {
    changeLoading: jest.fn()
  },
  actions: {}
}

const timelineState = {
  namespaced: true,
  modules: {
    Contents: contentsStore
  },
  state: {
    account: {
      accessToken: 'token',
      baseURL: 'http://localhost'
    }
  }
}

describe('Search/Account', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Toots: initStore(),
        TimelineSpace: timelineState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('search', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<Results>>(resolve => {
            const res: Response<Results> = {
              data: {
                accounts: [],
                statuses: [status],
                hashtags: []
              },
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('Toots/search', 'query')
      expect(store.state.Toots.results).toEqual([status])
    })
  })
})
