import { Response, Entity } from 'megalodon'
import { createStore, Store } from 'vuex'
import ListMembership, { ListMembershipState } from '@/store/TimelineSpace/Modals/ListMembership'
import { RootState } from '@/store'

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
  deleteAccountsFromList: (id: string, account_ids: Array<string>) => {
    if (id === list3.id && account_ids[0]) {
      return new Promise<Response>(resolve => {
        const res: Response = {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        }
        resolve(res)
      })
    } else {
      return Promise.reject(new Error('list id or account id is not match'))
    }
  },
  addAccountsToList: (id: string, account_ids: Array<string>) => {
    if (id === list1.id && account_ids[0] === account.id) {
      return new Promise<Response>(resolve => {
        const res: Response = {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {}
        }
        resolve(res)
      })
    } else {
      return Promise.reject(new Error('list id or account id is not match'))
    }
  }
}

jest.mock('megalodon', () => ({
  ...jest.requireActual<object>('megalodon'),
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
  fields: [],
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

const list3: Entity.List = {
  id: '3',
  title: 'list3'
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

const modalsStore = () => ({
  namespaced: true,
  modules: {
    ListMembership: initStore()
  }
})

const timelineStore = () => ({
  namespaced: true,
  state: {
    account: {
      id: 0,
      accessToken: 'token'
    },
    server: {
      sns: 'mastodon',
      baseURL: 'http://localhost'
    }
  },
  modules: {
    Modals: modalsStore()
  }
})

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('ListMembership', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        TimelineSpace: timelineStore(),
        App: appState
      }
    })
  })

  describe('fetchListMembership', () => {
    it('should get', async () => {
      await store.dispatch('TimelineSpace/Modals/ListMembership/fetchListMembership', {
        id: '5'
      })
      expect(store.state.TimelineSpace.Modals.ListMembership.belongToLists).toEqual([list1, list2])
    })
  })

  describe('fetchLists', () => {
    it('should be changed', async () => {
      await store.dispatch('TimelineSpace/Modals/ListMembership/fetchLists')
      expect(store.state.TimelineSpace.Modals.ListMembership.lists).toEqual([list1, list2])
    })
  })

  describe('changeBelongToLists', () => {
    beforeAll(() => {
      state = () => {
        return {
          modalOpen: false,
          account: account,
          lists: [],
          belongToLists: [list2, list3]
        }
      }
    })
    it('should be changed', async () => {
      await store.dispatch('TimelineSpace/Modals/ListMembership/changeBelongToLists', [list1.id, list2.id])
      expect(store.state.TimelineSpace.Modals.ListMembership.belongToLists).toEqual([list1, list2])
    })
  })
})
