import Mastodon from 'megalodon'

const Followers = {
  namespaced: true,
  state: {
    followers: [],
    relationships: []
  },
  mutations: {
    updateFollowers (state, users) {
      state.followers = users
    },
    updateRelationships (state, relations) {
      state.relationships = relations
    }
  },
  actions: {
    fetchFollowers ({ state, commit, rootState }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/${account.id}/followers`, { limit: 80 })
        .then(res => {
          commit('updateFollowers', res.data)
          return res.data
        })
    },
    fetchRelationships ({ commit, rootState }, accounts) {
      const ids = accounts.map(a => a.id)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/relationships`, {
        id: ids
      })
        .then(res => {
          commit('updateRelationships', res.data)
          return res.data
        })
    }
  }
}

export default Followers
