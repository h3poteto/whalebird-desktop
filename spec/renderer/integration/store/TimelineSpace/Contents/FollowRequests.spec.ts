import { Account, Response } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import FollowRequests, { FollowRequestsState } from '@/store/TimelineSpace/Contents/FollowRequests'
import { SideMenuState } from '@/store/TimelineSpace/SideMenu'

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

let state = (): FollowRequestsState => {
  return {
    requests: []
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: FollowRequests.actions,
    mutations: FollowRequests.mutations
  }
}

const sideMenuState = (): SideMenuState => {
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

const sideMenuStore = {
  namespaced: true,
  state: sideMenuState(),
  actions: {
    fetchFollowRequests: jest.fn()
  },
  mutations: {}
}

const timelineState = {
  namespaced: true,
  modules: {
    SideMenu: sideMenuStore
  },
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
        FollowRequests: initStore(),
        TimelineSpace: timelineState,
        App: appState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('fetchRequests', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<Array<Account>>>(resolve => {
            const res: Response<Array<Account>> = {
              data: [account],
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('FollowRequests/fetchRequests')
      expect(store.state.FollowRequests.requests).toEqual([account])
    })
  })

  describe('acceptRequest', () => {
    beforeAll(() => {
      state = () => {
        return {
          requests: [account]
        }
      }
    })
    it('should be succeed', async () => {
      const mockClient = {
        post: (_path: string, _params: object) => {
          return new Promise<Response<{}>>(resolve => {
            const res: Response<{}> = {
              data: {},
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        },
        get: (_path: string, _params: object) => {
          return new Promise<Response<Array<Account>>>(resolve => {
            const res: Response<Array<Account>> = {
              data: [],
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('FollowRequests/acceptRequest', account)
      expect(store.state.FollowRequests.requests).toEqual([])
    })
  })

  describe('rejectRequest', () => {
    beforeAll(() => {
      state = () => {
        return {
          requests: [account]
        }
      }
    })
    it('should be succeed', async () => {
      const mockClient = {
        post: (_path: string, _params: object) => {
          return new Promise<Response<{}>>(resolve => {
            const res: Response<{}> = {
              data: {},
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        },
        get: (_path: string, _params: object) => {
          return new Promise<Response<Array<Account>>>(resolve => {
            const res: Response<Array<Account>> = {
              data: [],
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('FollowRequests/rejectRequest', account)
      expect(store.state.FollowRequests.requests).toEqual([])
    })
  })
})
