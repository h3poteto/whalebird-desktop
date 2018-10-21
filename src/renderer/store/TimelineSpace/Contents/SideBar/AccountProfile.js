import Mastodon from 'megalodon'
import Timeline from './AccountProfile/Timeline'
import Follows from './AccountProfile/Follows'
import Followers from './AccountProfile/Followers'

const AccountProfile = {
  namespaced: true,
  modules: {
    Timeline,
    Follows,
    Followers
  },
  state: {
    account: null,
    relationship: null,
    loading: false
  },
  mutations: {
    changeAccount (state, account) {
      state.account = account
    },
    changeRelationship (state, relationship) {
      state.relationship = relationship
    },
    changeLoading (state, value) {
      state.loading = value
    }
  },
  actions: {
    fetchAccount ({ rootState }, accountID) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/${accountID}`)
        .then(res => res.data)
    },
    searchAccount ({ commit, rootState }, parsedAccount) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/search', { q: parsedAccount.acct, resolve: true })
        .then(res => {
          if (res.data.accounts.length <= 0) throw new AccountNotFound('not found')
          const account = res.data.accounts[0]
          if (`@${account.username}` !== parsedAccount.username) throw new AccountNotFound('not found')
          return account
        })
    },
    changeAccount ({ commit, dispatch }, account) {
      dispatch('fetchRelationship', account)
      commit('changeAccount', account)
    },
    fetchRelationship ({ state, commit, rootState }, account) {
      commit('changeRelationship', null)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/accounts/relationships', { id: [account.id] })
        .then(res => {
          commit('changeRelationship', res.data[0])
          return res.data
        })
    },
    follow ({ state, commit, rootState }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/follow`)
        .then(res => {
          commit('changeRelationship', res.data)
          return res.data
        })
    },
    unfollow ({ commit, rootState }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/unfollow`)
        .then(res => {
          commit('changeRelationship', res.data)
          return res.data
        })
    },
    close ({ commit }) {
      commit('changeAccount', null)
    },
    unmute ({ rootState, commit }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/unmute`)
        .then(res => {
          commit('changeRelationship', res.data)
          return res.data
        })
    },
    block ({ rootState, commit }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/block`)
        .then(res => {
          commit('changeRelationship', res.data)
          return res.data
        })
    },
    unblock ({ rootState, commit }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/unblock`)
        .then(res => {
          commit('changeRelationship', res.data)
          return res.data
        })
    }
  }
}

class AccountNotFound {
  constructor (msg) {
    this.msg = msg
  }
}

export default AccountProfile
