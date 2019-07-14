import { Response, Status, Account, Application } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Home, { HomeState } from '@/store/TimelineSpace/Contents/Home'

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
const status1: Status = {
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
const status2: Status = {
  id: '2',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'fuga',
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

let state = (): HomeState => {
  return {
    lazyLoading: false,
    heading: true,
    timeline: [],
    unreadTimeline: [],
    filter: '',
    showReblogs: true,
    showReplies: true
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Home.actions,
    mutations: Home.mutations
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

describe('Home', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Home: initStore(),
        TimelineSpace: timelineState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('fetchTimeline', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<Array<Status>>>(resolve => {
            const res: Response<Array<Status>> = {
              data: [status1],
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      const statuses = await store.dispatch('Home/fetchTimeline')
      expect(statuses).toEqual([status1])
      expect(store.state.Home.timeline).toEqual([status1])
    })
  })

  describe('lazyFetchTimeline', () => {
    describe('success', () => {
      beforeAll(() => {
        state = () => {
          return {
            lazyLoading: false,
            heading: true,
            timeline: [status1],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        }
      })
      it('should be updated', async () => {
        const mockClient = {
          get: (_path: string, _params: object) => {
            return new Promise<Response<Array<Status>>>(resolve => {
              const res: Response<Array<Status>> = {
                data: [status2],
                status: 200,
                statusText: 'OK',
                headers: {}
              }
              resolve(res)
            })
          }
        }
        mockedMegalodon.mockImplementation(() => mockClient)
        await store.dispatch('Home/lazyFetchTimeline', status1)
        expect(store.state.Home.lazyLoading).toEqual(false)
        expect(store.state.Home.timeline).toEqual([status1, status2])
      })
    })
  })
})
