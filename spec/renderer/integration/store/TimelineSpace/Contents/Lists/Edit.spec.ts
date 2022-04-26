import { Response, Entity } from 'megalodon'
import { createStore, Store } from 'vuex'
import Edit, { EditState } from '@/store/TimelineSpace/Contents/Lists/Edit'
import { RemoveAccountFromList } from '@/types/removeAccountFromList'
import { RootState } from '@/store'

const mockClient = {
  getAccountsInList: () => {
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
  deleteAccountsFromList: () => {
    return new Promise<Response<{}>>(resolve => {
      const res: Response<{}> = {
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

const state = (): EditState => {
  return {
    members: []
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Edit.actions,
    mutations: Edit.mutations
  }
}

const listsStore = () => ({
  namespaced: true,
  modules: {
    Edit: initStore()
  }
})

const contentsStore = () => ({
  namespaced: true,
  modules: {
    Lists: listsStore()
  }
})

const timelineStore = () => ({
  namespaced: true,
  state: {
    account: {
      accessToken: 'token',
      baseURL: 'http://localhost'
    },
    sns: 'mastodon'
  },
  modules: {
    Contents: contentsStore()
  }
})

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('Lists/Edit', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        TimelineSpace: timelineStore(),
        App: appState
      }
    })
  })

  describe('fetchMembers', () => {
    it('should get', async () => {
      await store.dispatch('TimelineSpace/Contents/Lists/Edit/fetchMembers', 'id')
      expect(store.state.TimelineSpace.Contents.Lists.Edit.members).toEqual([account])
    })
  })

  describe('removeAccount', () => {
    it('should be removed', async () => {
      const removeFromList: RemoveAccountFromList = {
        account: account,
        listId: 'id'
      }
      const res = await store.dispatch('TimelineSpace/Contents/Lists/Edit/removeAccount', removeFromList)
      expect(res.data).toEqual({})
    })
  })
})
