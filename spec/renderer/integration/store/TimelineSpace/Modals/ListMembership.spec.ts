import { Response, List, Account } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ListMembership, { ListMembershipState } from '@/store/TimelineSpace/Modals/ListMembership'

jest.mock('megalodon')

const account: Account = {
  id: 1,
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

const list1: List = {
  id: 1,
  title: 'list1'
}

const list2: List = {
  id: 2,
  title: 'list2'
}

let state = (): ListMembershipState => {
  return {
    modalOpen: false,
    account: null,
    lists: [],
    belongToLists: []
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: ListMembership.actions,
    mutations: ListMembership.mutations
  }
}

const timelineState = {
  namespaced: true,
  state: {
    account: {
      _id: '0'
    }
  }
}

describe('ListMembership', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        ListMembership: initStore(),
        TimelineSpace: timelineState
      }
    })
  })

  describe('fetchListMembership', () => {
    it('should be changed', async () => {
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
      await store.dispatch('ListMembership/fetchListMembership', {
        id: 5
      })
      expect(store.state.ListMembership.belongToLists).toEqual([1, 2])
    })
  })

  describe('fetchLists', () => {
    it('should be changed', async () => {
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
      await store.dispatch('ListMembership/fetchLists')
      expect(store.state.ListMembership.lists).toEqual([
        list1,
        list2
      ])
    })
  })

  describe('changeBelongToLists', () => {
    beforeAll(() => {
      state = () => {
        return {
          modalOpen: false,
          account: account,
          lists: [],
          belongToLists: [
            list2
          ]
        }
      }
    })
    it('should be changed', async () => {
      const mockClient = {
        del: (_path: string, _params: object) => {
          return new Promise<Response>(resolve => {
            const res: Response = {
              data: {},
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        },
        post: (_path: string, _params: object) => {
          return new Promise<Response>(resolve => {
            const res: Response = {
              data: {},
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
      }
      mockedMegalodon.mockImplementation(() => mockClient)
      await store.dispatch('ListMembership/changeBelongToLists', [list1])
      expect(store.state.ListMembership.belongToLists).toEqual([list1])
    })
  })
})
