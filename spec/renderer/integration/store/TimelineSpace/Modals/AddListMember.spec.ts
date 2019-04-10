import { Response, Account } from 'megalodon'
import mockedMegalodon from '~/spec/mock/megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import AddListMember, { AddListMemberState } from '@/store/TimelineSpace/Modals/AddListMember'

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

const timelineState = {
  namespaced: true,
  state: {
    account: {
      _id: '0'
    }
  }
}

describe('AddListMember', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        AddListMember: initStore(),
        TimelineSpace: timelineState
      }
    })
    mockedMegalodon.mockClear()
  })

  describe('changeModal', () => {
    it('should change modal', () => {
      store.dispatch('AddListMember/changeModal', true)
      expect(store.state.AddListMember.modalOpen).toEqual(true)
    })
  })

  describe('search', () => {
    it('should be searched', async () => {
      const mockClient = {
        get: () => {
          return new Promise<Response<Account[]>>(resolve => {
            const res: Response<Account[]> = {
              data: [
                account
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
      await store.dispatch('AddListMember/search', 'akira')
      expect(store.state.AddListMember.accounts).toEqual([
        account
      ])
    })
  })

  describe('add', () => {
    it('should be added a member to the list', async () => {
      const mockClient = {
        post: () => {
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
      const result = await store.dispatch('AddListMember/add', 'akira')
      expect(result).toEqual({})
    })
  })
})
