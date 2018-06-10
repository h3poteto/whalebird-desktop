import Mastodon from 'megalodon'

const Follows = {
  namespaced: true,
  state: {
    follows: []
  },
  mutations: {
    updateFollows (state, users) {
      state.follows = users
    }
  },
  actions: {
    fetchFollows ({ state, commit, rootState }, account) {
      commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true, { root: true })
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/${account.id}/following`, { limit: 80 })
        .then(data => {
          commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
          commit('updateFollows', data)
          return data
        })
    }
  }
}

export default Follows
