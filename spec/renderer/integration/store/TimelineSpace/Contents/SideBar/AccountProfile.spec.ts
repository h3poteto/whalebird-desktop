import { RootState } from '@/store'
import { Entity } from 'megalodon'
import { createStore, Store } from 'vuex'
import AccountProfile, { AccountProfileState } from '~/src/renderer/store/TimelineSpace/Contents/SideBar/AccountProfile'

const state = (account: Entity.Account | null): AccountProfileState => {
  return {
    loading: false,
    relationship: null,
    account: account,
    identityProofs: []
  }
}

const initStore = (account: Entity.Account | null) => {
  return {
    namespaced: true,
    state: state(account),
    actions: AccountProfile.actions,
    mutations: AccountProfile.mutations,
    getters: AccountProfile.getters
  }
}

const sidebarStore = (account: Entity.Account | null) => ({
  namespaced: true,
  modules: {
    AccountProfile: initStore(account)
  }
})

const contentsStore = (account: Entity.Account | null) => ({
  namespaced: true,
  modules: {
    SideBar: sidebarStore(account)
  }
})

const timelineStore = (account: Entity.Account | null) => ({
  namespaced: true,
  state: {
    account: {
      accessToken: 'sampleAccessToken',
      id: 1,
      username: 'h3poteto'
    },
    server: {
      sns: 'mastodon',
      baseURL: 'https://example.com'
    }
  },
  modules: {
    Contents: contentsStore(account)
  }
})

describe('AccountProfile', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        TimelineSpace: timelineStore(null)
      }
    })
  })

  describe('isOwnProfile', () => {
    describe('target is a same Mastodon account', () => {
      const account: Entity.Account = {
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
        fields: [],
        bot: false
      }
      beforeEach(() => {
        store = createStore({
          modules: {
            TimelineSpace: timelineStore(account)
          }
        })
      })
      it('should be matched', () => {
        expect(store.getters['TimelineSpace/Contents/SideBar/AccountProfile/isOwnProfile']).toBeTruthy()
      })
    })

    describe('target is another Mastodon account', () => {
      const account: Entity.Account = {
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
        fields: [],
        bot: false
      }
      beforeEach(() => {
        store = createStore({
          modules: {
            TimelineSpace: timelineStore(account)
          }
        })
      })
      it('should be matched', () => {
        expect(store.getters['TimelineSpace/Contents/SideBar/AccountProfile/isOwnProfile']).toBeFalsy()
      })
    })

    describe('target is a same Pleroma account', () => {
      const account: Entity.Account = {
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
        fields: [],
        bot: false
      }
      beforeEach(() => {
        store = createStore({
          modules: {
            TimelineSpace: timelineStore(account)
          }
        })
      })
      it('should be matched', () => {
        expect(store.getters['TimelineSpace/Contents/SideBar/AccountProfile/isOwnProfile']).toBeTruthy()
      })
    })

    describe('target is another Pleroma account', () => {
      const account: Entity.Account = {
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
        fields: [],
        bot: false
      }
      beforeEach(() => {
        store = createStore({
          modules: {
            TimelineSpace: timelineStore(account)
          }
        })
      })
      it('should be matched', () => {
        expect(store.getters['TimelineSpace/Contents/SideBar/AccountProfile/isOwnProfile']).toBeFalsy()
      })
    })
  })
})
