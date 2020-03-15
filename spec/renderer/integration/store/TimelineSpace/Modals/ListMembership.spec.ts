import { Response, Entity } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ListMembership, { ListMembershipState } from '@/store/TimelineSpace/Modals/ListMembership'

const mockClient = {
  getAccountLists: () => {
    return new Promise<Response<Entity.List[]>>(resolve => {
      const res: Response<Entity.List[]> = {
        data: [list1, list2],
        status: 200,
        statusText: 'OK',
        headers: {}
      }
      resolve(res)
    })
  },
  getLists: () => {
    return new Promise<Response<Entity.List[]>>(resolve => {
      const res: Response<Entity.List[]> = {
        data: [list1, list2],
        status: 200,
        statusText: 'OK',
        headers: {}
      }
      resolve(res)
    })
  },
  deleteAccountsFromList: () => {
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
  addAccountsToList: () => {
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

const list1: Entity.List = {
  id: '1',
  title: 'list1'
}

const list2: Entity.List = {
  id: '2',
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

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
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
        TimelineSpace: timelineState,
        App: appState
      }
    })
  })

  describe('fetchListMembership', () => {
    it('should get', async () => {
      await store.dispatch('ListMembership/fetchListMembership', {
        id: '5'
      })
      expect(store.state.ListMembership.belongToLists).toEqual(['1', '2'])
    })
  })

  describe('fetchLists', () => {
    it('should be changed', async () => {
      await store.dispatch('ListMembership/fetchLists')
      expect(store.state.ListMembership.lists).toEqual([list1, list2])
    })
  })

  describe('changeBelongToLists', () => {
    beforeAll(() => {
      state = () => {
        return {
          modalOpen: false,
          account: account,
          lists: [],
          belongToLists: [list2]
        }
      }
    })
    it('should be changed', async () => {
      await store.dispatch('ListMembership/changeBelongToLists', [list1])
      expect(store.state.ListMembership.belongToLists).toEqual([list1])
    })
  })
})
