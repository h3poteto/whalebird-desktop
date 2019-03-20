import Mastodon from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ListMembership from '~/src/renderer/store/TimelineSpace/Modals/ListMembership'

jest.genMockFromModule('megalodon')
jest.mock('megalodon')

let state = () => {
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
    Mastodon.mockClear()
  })

  describe('fetchListMembership', () => {
    it('should be changed', async () => {
      const mockClient = {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: [
                { id: 1 },
                { id: 2 },
                { id: 3 }
              ]
            })
          })
        }
      }
      Mastodon.mockImplementation(() => mockClient)
      await store.dispatch('ListMembership/fetchListMembership', {
        id: 5
      })
      expect(store.state.ListMembership.belongToLists).toEqual([1, 2, 3])
    })
  })

  describe('fetchLists', () => {
    it('should be changed', async () => {
      const mockClient = {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: [
                { id: 1, name: 'list1' },
                { id: 2, name: 'list2' },
                { id: 3, name: 'list3' }
              ]
            })
          })
        }
      }
      Mastodon.mockImplementation(() => mockClient)
      await store.dispatch('ListMembership/fetchLists')
      expect(store.state.ListMembership.lists).toEqual([
        { id: 1, name: 'list1' },
        { id: 2, name: 'list2' },
        { id: 3, name: 'list3' }
      ])
    })
  })

  describe('changeBelongToLists', () => {
    beforeAll(() => {
      state = () => {
        return {
          modalOpen: false,
          account: {
            id: 65
          },
          lists: [],
          belongToLists: [
            { id: 2, name: 'list2' }
          ]
        }
      }
    })
    it('should be changed', async () => {
      const mockClient = {
        del: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: true
            })
          })
        },
        post: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: true
            })
          })
        }
      }
      Mastodon.mockImplementation(() => mockClient)
      await store.dispatch('ListMembership/changeBelongToLists', [{ id: 1, name: 'list1' }])
      expect(store.state.ListMembership.belongToLists).toEqual([{ id: 1, name: 'list1' }])
    })
  })
})
