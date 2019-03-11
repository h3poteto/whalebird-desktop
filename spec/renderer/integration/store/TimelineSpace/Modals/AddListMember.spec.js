import Mastodon from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import AddListMember from '~/src/renderer/store/TimelineSpace/Modals/AddListMember'

jest.genMockFromModule('megalodon')
jest.mock('megalodon')

const state = () => {
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
    Mastodon.mockClear()
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
          return new Promise((resolve, reject) => {
            resolve({
              data: [
                { id: 1, name: 'h3poteto' },
                { id: 2, name: 'akito19' }
              ]
            })
          })
        }
      }

      Mastodon.mockImplementation(() => mockClient)
      await store.dispatch('AddListMember/search', 'akira')
      expect(store.state.AddListMember.accounts).toEqual([
        { id: 1, name: 'h3poteto' },
        { id: 2, name: 'akito19' }
      ])
    })
  })

  describe('add', () => {
    it('should be added a member to the list', async () => {
      const mockClient = {
        post: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: true
            })
          })
        }
      }

      Mastodon.mockImplementation(() => mockClient)
      const result = await store.dispatch('AddListMember/add', 'akira')
      expect(result.data).toEqual(true)
    })
  })
})
