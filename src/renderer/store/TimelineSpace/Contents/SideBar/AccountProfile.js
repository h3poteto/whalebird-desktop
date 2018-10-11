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
    searchAccount ({ commit, rootState }, accountURL) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/search', { q: accountURL, resolve: true })
        .then(res => {
          if (res.data.accounts.length <= 0) throw new AccountNotFound('not found')
          return res.data.accounts[0]
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
      commit('changeLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/follow`)
        .then(res => {
          commit('changeLoading', false)
          commit('changeRelationship', res.data)
          return res.data
        })
        .catch(err => {
          commit('changeLoading', false)
          throw err
        })
    },
    unfollow ({ commit, rootState }, account) {
      commit('changeLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/unfollow`)
        .then(res => {
          commit('changeRelationship', res.data)
          return res.data
        })
        .finally(() => {
          commit('changeLoading', false)
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
