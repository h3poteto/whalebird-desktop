import { Account } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import AccountProfile, { AccountProfileState } from '~/src/renderer/store/TimelineSpace/Contents/SideBar/AccountProfile'

const state = (account: Account | null): AccountProfileState => {
  return {
    loading: false,
    relationship: null,
    account: account
  }
}

const timelineSpace = {
  namespaced: true,
  state: {
    account: {
      baseURL: 'https://example.com',
      domain: 'example.com',
      clientId: 'sampleId',
      clientSecret: 'sampleSecret',
      accessToken: 'sampleAccessToken',
      refreshToken: null,
      username: 'h3poteto',
      accountID: '1',
      avatar: null,
      order: 1
    }
  }
}

const initStore = (account: Account | null) => {
  return {
    namespaced: true,
    state: state(account),
    actions: AccountProfile.actions,
    mutations: AccountProfile.mutations,
    getters: AccountProfile.getters
  }
}

describe('AccountProfile', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        AccountProfile: initStore(null),
        TimelineSpace: timelineSpace
      }
    })
  })

  describe('isOwnProfile', () => {
    describe('target is a same Mastodon account', () => {
      const account: Account = {
        id: '1',
        username: 'h3poteto',
        acct: 'h3poteto@example.com',
        display_name: 'h3poteto',
        locked: false,
        created_at: '2019-10-28T23:11:54',
        followers_count: 100,
        following_count: 200,
        statuses_count: 500,
        note: '',
        url: 'https://example.com/@h3poteto',
        avatar: '',
        avatar_static: '',
        header: '',
        header_static: '',
        emojis: [],
        moved: null,
        fields: null,
        bot: false
      }
      beforeEach(() => {
        store = new Vuex.Store({
          modules: {
            AccountProfile: initStore(account),
            TimelineSpace: timelineSpace
          }
        })
      })
      it('should be matched', () => {
        expect(store.getters['AccountProfile/isOwnProfile']).toBeTruthy()
      })
    })

    describe('target is another Mastodon account', () => {
      const account: Account = {
        id: '1',
        username: 'h3poteto',
        acct: 'h3poteto@another.example.com',
        display_name: 'h3poteto',
        locked: false,
        created_at: '2019-10-28T23:11:54',
        followers_count: 100,
        following_count: 200,
        statuses_count: 500,
        note: '',
        url: 'https://another.example.com/@h3poteto',
        avatar: '',
        avatar_static: '',
        header: '',
        header_static: '',
        emojis: [],
        moved: null,
        fields: null,
        bot: false
      }
      beforeEach(() => {
        store = new Vuex.Store({
          modules: {
            AccountProfile: initStore(account),
            TimelineSpace: timelineSpace
          }
        })
      })
      it('should be matched', () => {
        expect(store.getters['AccountProfile/isOwnProfile']).toBeFalsy()
      })
    })

    describe('target is a same Pleroma account', () => {
      const account: Account = {
        id: '1',
        username: 'h3poteto',
        acct: 'h3poteto@example.com',
        display_name: 'h3poteto',
        locked: false,
        created_at: '2019-10-28T23:11:54',
        followers_count: 100,
        following_count: 200,
        statuses_count: 500,
        note: '',
        url: 'https://example.com/users/h3poteto',
        avatar: '',
        avatar_static: '',
        header: '',
        header_static: '',
        emojis: [],
        moved: null,
        fields: null,
        bot: false
      }
      beforeEach(() => {
        store = new Vuex.Store({
          modules: {
            AccountProfile: initStore(account),
            TimelineSpace: timelineSpace
          }
        })
      })
      it('should be matched', () => {
        expect(store.getters['AccountProfile/isOwnProfile']).toBeTruthy()
      })
    })

    describe('target is another Pleroma account', () => {
      const account: Account = {
        id: '1',
        username: 'h3poteto',
        acct: 'h3poteto@another.example.com',
        display_name: 'h3poteto',
        locked: false,
        created_at: '2019-10-28T23:11:54',
        followers_count: 100,
        following_count: 200,
        statuses_count: 500,
        note: '',
        url: 'https://another.example.com/users/h3poteto',
        avatar: '',
        avatar_static: '',
        header: '',
        header_static: '',
        emojis: [],
        moved: null,
        fields: null,
        bot: false
      }
      beforeEach(() => {
        store = new Vuex.Store({
          modules: {
            AccountProfile: initStore(account),
            TimelineSpace: timelineSpace
          }
        })
      })
      it('should be matched', () => {
        expect(store.getters['AccountProfile/isOwnProfile']).toBeFalsy()
      })
    })
  })
})
