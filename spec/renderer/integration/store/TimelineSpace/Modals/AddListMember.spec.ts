import { Response, Entity } from 'megalodon'
import { createStore, Store } from 'vuex'
import AddListMember, { AddListMemberState } from '@/store/TimelineSpace/Modals/AddListMember'
import { RootState } from '@/store'

const mockClient = {
  searchAccount: () => {
    return new Promise<Response<Entity.Account[]>>(resolve => {
      const res: Response<Entity.Account[]> = {
        data: [account],
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
  group: false,
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
  bot: false,
  noindex: null,
  suspended: null,
  limited: null
}

const state = (): AddListMemberState => {
  return {
    modalOpen: false,
    accounts: [],
    targetListId: null
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: AddListMember.actions,
    mutations: AddListMember.mutations
  }
}

const modalsStore = () => ({
  namespaced: true,
  modules: {
    AddListMember: initStore()
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
      sns: 'mastodon'
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

describe('AddListMember', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        AddListMember: initStore(),
        TimelineSpace: timelineStore(),
        App: appState
      }
    })
  })

  describe('changeModal', () => {
    it('should change modal', () => {
      store.dispatch('TimelineSpace/Modals/AddListMember/changeModal', true)
      expect(store.state.TimelineSpace.Modals.AddListMember.modalOpen).toEqual(true)
    })
  })

  describe('search', () => {
    it('should be searched', async () => {
      await store.dispatch('TimelineSpace/Modals/AddListMember/search', 'akira')
      expect(store.state.TimelineSpace.Modals.AddListMember.accounts).toEqual([account])
    })
  })

  describe('add', () => {
    it('should be added a member to the list', async () => {
      const result = await store.dispatch('TimelineSpace/Modals/AddListMember/add', 'akira')
      expect(result).toEqual({})
    })
  })
})
