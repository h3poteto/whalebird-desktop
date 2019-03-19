import Mastodon from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Mentions from '~/src/renderer/store/TimelineSpace/Contents/Mentions'

jest.genMockFromModule('megalodon')
jest.mock('megalodon')

let state = () => {
  return {
    lazyLoading: false,
    heading: true,
    mentions: [],
    unreadMentions: [],
    filter: ''
  }
}

const initStore =() => {
  return {
    namespaced: true,
    state: state(),
    actions: Mentions.actions,
    mutations: Mentions.mutations
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

describe('Mentions', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Mentions: initStore(),
        TimelineSpace: timelineState
      }
    })
    Mastodon.mockClear()
  })

  describe('fetchMentions', () => {
    it('should be updated', async () => {
      const mockClient = {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({
              data: [
                { id: 1, type: 'mention' },
                { id: 2, type: 'favourite' },
                { id: 3, type: 'reblog' },
                { id: 4, type: 'follow' }
              ]
            })
          })
        }
      }

      Mastodon.mockImplementation(() => mockClient)
      const mentions = await store.dispatch('Mentions/fetchMentions')
      expect(store.state.Mentions.mentions).toEqual([
        { id: 1, type: 'mention' },
        { id: 2, type: 'favourite' },
        { id: 3, type: 'reblog' },
        { id: 4, type: 'follow' }
      ])
    })
  })

  describe('lazyFetchMentions', () => {
    describe('last is null', ()  => {
      it('should not be updated', async () => {
        const result = await store.dispatch('Mentions/lazyFetchMentions', null)
        expect(result).toEqual(null)
      })
    })

    describe('loading', () => {
      beforeAll(() => {
        state = () => {
          return {
            lazyLoading: true,
            heading: true,
            mentions: [],
            unreadMentions: [],
            filter: ''
          }
        }
      })
      it('should not be updated', async () => {
        const result = await store.dispatch('Mentions/lazyFetchMentions', {})
        expect(result).toEqual(null)
      })
    })

    describe('success', () => {
      beforeAll(() => {
        state = () => {
          return {
            lazyLoading: false,
            heading: true,
            mentions: [
              { id: 1, type: 'mention' },
              { id: 2, type: 'favourite' },
              { id: 3, type: 'reblog' },
              { id: 4, type: 'follow' }
            ],
            unreadMentions: [],
            filter: ''
          }
        }
      })
      it('should be updated', async () => {
        const mockClient = {
          get: () => {
            return new Promise((resolve, reject) => {
              resolve({
                data: [
                  { id: 5, type: 'mention' },
                  { id: 6, type: 'favourite' }
                ]
              })
            })
          }
        }

        Mastodon.mockImplementation(() => mockClient)
        const mentions = await store.dispatch('Mentions/lazyFetchMentions', { id: 1 })
        expect(store.state.Mentions.mentions).toEqual([
          { id: 1, type: 'mention' },
          { id: 2, type: 'favourite' },
          { id: 3, type: 'reblog' },
          { id: 4, type: 'follow' },
          { id: 5, type: 'mention' },
          { id: 6, type: 'favourite' }
        ])
        expect(store.state.Mentions.lazyLoading).toEqual(false)
      })
    })
  })
})
