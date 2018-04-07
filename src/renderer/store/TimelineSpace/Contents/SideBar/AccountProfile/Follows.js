import Mastodon from 'mastodon-api'

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
      return new Promise((resolve, reject) => {
        commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true, { root: true })
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get(`/accounts/${account.id}/following`, { limit: 80 }, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
          commit('updateFollows', data)
          resolve(res)
        })
      })
    }
  }
}

export default Follows
