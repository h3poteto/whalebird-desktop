import { Response, Status, Account, Application } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Favourites, { FavouritesState } from '@/store/TimelineSpace/Contents/Favourites'
import { LocalAccount } from '~/src/types/localAccount'

jest.mock('megalodon')

const localAccount: LocalAccount = {
  _id: '1',
  baseURL: 'http://localhost',
  domain: 'localhost',
  clientId: 'id',
  clientSecret: 'secret',
  accessToken: 'token',
  refreshToken: null,
  username: 'hoge',
  accountId: '1',
  avatar: null,
  order: 1
}

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

let state = (): FavouritesState => {
  return {
    favourites: [],
    lazyLoading: false,
    filter: '',
    maxId: null
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Favourites.actions,
    mutations: Favourites.mutations
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

describe('Favourites', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Favourites: initStore(),
        TimelineSpace: timelineState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('fetchFavourites', () => {
    it('does not exist header', async () => {
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
      await store.dispatch('Favourites/fetchFavourites', localAccount)
      expect(store.state.Favourites.favourites).toEqual([status1])
      expect(store.state.Favourites.maxId).toEqual(null)
    })

    it('link is null', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<Array<Status>>>(resolve => {
            const res: Response<Array<Status>> = {
              data: [status1],
              status: 200,
              statusText: 'OK',
              headers: {
                link: null
              }
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('Favourites/fetchFavourites', localAccount)
      expect(store.state.Favourites.favourites).toEqual([status1])
      expect(store.state.Favourites.maxId).toEqual(null)
    })

    it('link exists in header', async () => {
      const mockClient = {
        get: (_path: string, _params: object) => {
          return new Promise<Response<Array<Status>>>(resolve => {
            const res: Response<Array<Status>> = {
              data: [status1],
              status: 200,
              statusText: 'OK',
              headers: {
                link: '<http://localhost?max_id=2>; rel="next"'
              }
            }
            resolve(res)
          })
        }
      }

      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('Favourites/fetchFavourites', localAccount)
      expect(store.state.Favourites.favourites).toEqual([status1])
      expect(store.state.Favourites.maxId).toEqual('2')
    })
  })

  describe('lazyFetchFavourites', () => {
    describe('lazyLoading', () => {
      beforeAll(() => {
        state = () => {
          return {
            favourites: [],
            lazyLoading: true,
            filter: '',
            maxId: null
          }
        }
      })
      it('should not be updated', async () => {
        const res = await store.dispatch('Favourites/lazyFetchFavourites')
        expect(res).toEqual(null)
      })
    })

    describe('does not exist maxId', () => {
      beforeAll(() => {
        state = () => {
          return {
            favourites: [],
            lazyLoading: false,
            filter: '',
            maxId: null
          }
        }
      })
      it('should not be updated', async () => {
        const res = await store.dispatch('Favourites/lazyFetchFavourites')
        expect(res).toEqual(null)
      })
    })

    describe('fetch', () => {
      beforeAll(() => {
        state = () => {
          return {
            favourites: [status1],
            lazyLoading: false,
            filter: '',
            maxId: '2'
          }
        }
      })
      it('link is null', async () => {
        const mockClient = {
          get: (_path: string, _params: object) => {
            return new Promise<Response<Array<Status>>>(resolve => {
              const res: Response<Array<Status>> = {
                data: [status2],
                status: 200,
                statusText: 'OK',
                headers: {
                  link: null
                }
              }
              resolve(res)
            })
          }
        }

        mockedMegalodon.mockImplementation(() => mockClient)
        await store.dispatch('Favourites/lazyFetchFavourites')
        expect(store.state.Favourites.favourites).toEqual([status1, status2])
        expect(store.state.Favourites.maxId).toEqual(null)
      })

      it('link exists in header', async () => {
        const mockClient = {
          get: (_path: string, _params: object) => {
            return new Promise<Response<Array<Status>>>(resolve => {
              const res: Response<Array<Status>> = {
                data: [status2],
                status: 200,
                statusText: 'OK',
                headers: {
                  link: '<http://localhost?max_id=3>; rel="next"'
                }
              }
              resolve(res)
            })
          }
        }

        mockedMegalodon.mockImplementation(() => mockClient)
        await store.dispatch('Favourites/lazyFetchFavourites')
        expect(store.state.Favourites.favourites).toEqual([status1, status2])
        expect(store.state.Favourites.maxId).toEqual('3')
      })
    })
  })
})
