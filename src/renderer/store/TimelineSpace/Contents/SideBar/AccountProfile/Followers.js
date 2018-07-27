import Mastodon from 'megalodon'

const Followers = {
  namespaced: true,
  state: {
    followers: []
  },
  mutations: {
    updateFollowers (state, users) {
      state.followers = users
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
          commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
          commit('updateFollowers', res.data)
          return res.data
        })
    }
  }
}

export default Followers
