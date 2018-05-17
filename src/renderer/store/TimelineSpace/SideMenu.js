import Mastodon from 'mastodon-api'

const SideMenu = {
  namespaced: true,
  state: {
    unreadHomeTimeline: false,
    unreadNotifications: false,
    unreadLocalTimeline: false,
    lists: []
  },
  mutations: {
    changeUnreadHomeTimeline (state, value) {
      state.unreadHomeTimeline = value
    },
    changeUnreadNotifications (state, value) {
      state.unreadNotifications = value
    },
    changeUnreadLocalTimeline (state, value) {
      state.unreadLocalTimeline = value
    },
    updateLists (state, lists) {
      state.lists = lists
    }
  },
  actions: {
    fetchLists ({ commit }, account) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: account.accessToken,
            api_url: account.baseURL + '/api/v1'
          }
        )
        client.get('/lists', {}, (err, data, res) => {
          if (err) return reject(err)
          commit('updateLists', data)
          resolve(res)
        })
      })
    },
    clearUnread ({ commit }) {
      commit('changeUnreadHomeTimeline', false)
      commit('changeUnreadNotifications', false)
      commit('changeUnreadLocalTimeline', false)
    }
  }
}

export default SideMenu
