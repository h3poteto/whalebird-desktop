import Mastodon from 'megalodon'

const Follows = {
  namespaced: true,
  state: {
    follows: [],
    relationships: []
  },
  mutations: {
    updateFollows (state, users) {
      state.follows = users
    },
    updateRelationships (state, relations) {
      state.relationships = relations
    }
  },
  actions: {
    fetchFollows ({ state, commit, rootState }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/${account.id}/following`, { limit: 80 })
        .then(res => {
          commit('updateFollows', res.data)
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

export default Follows
