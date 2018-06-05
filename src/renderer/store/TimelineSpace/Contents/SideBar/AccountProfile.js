import Mastodon from 'mastodon-api'
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
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.get('/search', { q: accountURL }, (err, data, res) => {
          if (err) return reject(err)
          if (data.accounts.length <= 0) return reject(new AccountNotFound('not found'))
          resolve(data.accounts[0])
        })
      })
    },
    changeAccount ({ commit, dispatch }, account) {
      dispatch('fetchRelationship', account)
      commit('changeAccount', account)
    },
    fetchRelationship ({ state, commit, rootState }, account) {
      return new Promise((resolve, reject) => {
        commit('changeRelationship', null)
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get('/accounts/relationships', { id: [account.id] }, (err, data, res) => {
          if (err) return reject(err)
          commit('changeRelationship', data[0])
          resolve(res)
        })
      })
    },
    follow ({ state, commit, rootState }, account) {
      return new Promise((resolve, reject) => {
        commit('changeLoading', true)
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.post(`/accounts/${account.id}/follow`, {}, (err, data, res) => {
          commit('changeLoading', false)
          if (err) return reject(err)
          commit('changeRelationship', data)
          resolve(res)
        })
      })
    },
    unfollow ({ state, commit, rootState }, account) {
      return new Promise((resolve, reject) => {
        commit('changeLoading', true)
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.post(`/accounts/${account.id}/unfollow`, {}, (err, data, res) => {
          commit('changeLoading', false)
          if (err) return reject(err)
          commit('changeRelationship', data)
          resolve(res)
        })
      })
    },
    close ({ commit }) {
      commit('changeAccount', null)
    }
  }
}

class AccountNotFound {
  constructor (msg) {
    this.msg = msg
  }
}

export default AccountProfile
