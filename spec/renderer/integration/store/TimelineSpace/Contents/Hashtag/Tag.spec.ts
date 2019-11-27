import { Response, Status, Account, Application } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Tag, { TagState } from '@/store/TimelineSpace/Contents/Hashtag/Tag'
import { LoadPositionWithTag } from '@/types/loadPosition'

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

let state = (): TagState => {
  return {
    lazyLoading: false,
    heading: true,
    timeline: [],
    unreadTimeline: [],
    filter: ''
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Tag.actions,
    mutations: Tag.mutations
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

describe('Home', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Tag: initStore(),
        TimelineSpace: timelineState,
        App: appState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('fetch', () => {
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
      const statuses = await store.dispatch('Tag/fetch', 'tag')
      expect(statuses).toEqual([status1])
      expect(store.state.Tag.timeline).toEqual([status1])
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
            filter: ''
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
        const loadPositionWithTag: LoadPositionWithTag = {
          status: status1,
          tag: 'tag'
        }
        await store.dispatch('Tag/lazyFetchTimeline', loadPositionWithTag)
        expect(store.state.Tag.lazyLoading).toEqual(false)
        expect(store.state.Tag.timeline).toEqual([status1, status2])
      })
    })
  })
})
