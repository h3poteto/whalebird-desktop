import Mastodon from 'mastodon-api'

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
      return new Promise((resolve, reject) => {
        commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true, { root: true })
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get(`/accounts/${account.id}/followers`, { limit: 80 }, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
          commit('updateFollowers', data)
          resolve(res)
        })
      })
    }
  }
}

export default Followers
