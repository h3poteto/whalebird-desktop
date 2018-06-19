import Mastodon from 'megalodon'

const SideMenu = {
  namespaced: true,
  state: {
    unreadHomeTimeline: false,
    unreadNotifications: false,
    unreadLocalTimeline: false,
    lists: [],
    overrideActivePath: null
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
    },
    updateOverrideActivePath (state, path) {
      state.overrideActivePath = path
    }
  },
  actions: {
    fetchLists ({ commit, rootState }, account = null) {
      if (account === null) account = rootState.TimelineSpace.account
      const client = new Mastodon(
        account.accessToken,
        account.baseURL + '/api/v1'
      )
      return client.get('/lists')
        .then(data => {
          commit('updateLists', data)
          return data
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
