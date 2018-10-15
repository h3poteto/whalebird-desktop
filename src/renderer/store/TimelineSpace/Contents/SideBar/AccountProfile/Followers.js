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
      commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true, { root: true })
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/${account.id}/followers`, { limit: 80 })
        .then(res => {
          commit('updateFollowers', res.data)
          return res.data
        })
        .finally(() => {
          commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
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
