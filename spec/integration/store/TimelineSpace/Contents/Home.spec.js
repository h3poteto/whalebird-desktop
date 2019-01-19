import Mastodon from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Home from '~/src/renderer/store/TimelineSpace/Contents/Home'

jest.genMockFromModule('megalodon')
jest.mock('megalodon')

const state = {
  lazyLoading: false,
  heading: true,
  timeline: [],
  unreadTimeline: [],
  filter: '',
  showReblogs: true,
  showReplies: true
}

const initState = {
  namespaced: true,
  state: state,
  actions: Home.actions,
  mutations: Home.mutations
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

describe('Home', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Home: initState,
        TimelineSpace: timelineState
      }
    })
    Mastodon.mockClear()
  })

  describe('fetchTimeline', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: [
                { id: 1 },
                { id: 2 }
              ]
            })
          })
        }
      }

      Mastodon.mockImplementation(() => mockClient)
      const statuses = await store.dispatch('Home/fetchTimeline')
      expect(statuses).toEqual([
        { id: 1 },
        { id: 2 }
      ])
      expect(store.state.Home.timeline).toEqual([
        { id: 1 },
        { id: 2 }
      ])
    })
  })

  describe('lazyFetchTimeline', () => {
    describe('last is null', () => {
      it('should not be updated', async () => {
        const result = await store.dispatch('Home/lazyFetchTimeline', null)
        expect(result).toEqual(null)
      })
    })
    describe('success', () => {
      it('should be updated', async () => {
        const mockClient = {
          get: () => {
            return new Promise((resolve, reject) => {
              resolve({
                data: [
                  { id: 19 },
                  { id: 18 }
                ]
              })
            })
          }
        }
        Mastodon.mockImplementation(() => mockClient)
        await store.dispatch('Home/lazyFetchTimeline', { id: 20 })
        expect(store.state.Home.lazyLoading).toEqual(false)
        expect(store.state.Home.timeline).toEqual([
          { id: 1 },
          { id: 2 },
          { id: 19 },
          { id: 18 }
        ])
      })
    })
  })
})
