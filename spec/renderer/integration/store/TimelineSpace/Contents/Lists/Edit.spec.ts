import { Response, Account } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Edit, { EditState } from '@/store/TimelineSpace/Contents/Lists/Edit'
import { RemoveAccountFromList } from '@/types/removeAccountFromList'

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

let state = (): EditState => {
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

describe('Lists/Edit', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Edit: initStore(),
        TimelineSpace: timelineState,
        App: appState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('fetchMembers', () => {
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
      await store.dispatch('Edit/fetchMembers', 'id')
      expect(store.state.Edit.members).toEqual([account])
    })
  })

  describe('removeAccount', () => {
    it('should be removed', async () => {
      const mockClient = {
        del: (_path: string, _params: object) => {
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

      mockedMegalodon.mockImplementation(() => mockClient)
      const removeFromList: RemoveAccountFromList = {
        account: account,
        listId: 'id'
      }
      const res = await store.dispatch('Edit/removeAccount', removeFromList)
      expect(res.data).toEqual({})
    })
  })
})
