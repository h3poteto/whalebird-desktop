import Mastodon from 'mastodon-api'
import Timeline from './AccountProfile/Timeline'

const AccountProfile = {
  namespaced: true,
  modules: {
    Timeline
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
    }
  }
}

export default AccountProfile
