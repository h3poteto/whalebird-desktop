import Mastodon from 'megalodon'
import { ipcRenderer } from 'electron'

const SideMenu = {
  namespaced: true,
  state: {
    unreadHomeTimeline: false,
    unreadNotifications: false,
    unreadLocalTimeline: false,
    lists: [],
    overrideActivePath: null,
    collapse: false
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
    },
    changeCollapse (state, collapse) {
      state.collapse = collapse
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
        .then(res => {
          commit('updateLists', res.data)
          return res.data
        })
    },
    clearUnread ({ commit }) {
      commit('changeUnreadHomeTimeline', false)
      commit('changeUnreadNotifications', false)
      commit('changeUnreadLocalTimeline', false)
    },
    changeCollapse ({ commit }, value) {
      commit('changeCollapse', value)
      ipcRenderer.send('change-collapse', value)
    },
    readCollapse ({ commit }) {
      ipcRenderer.send('get-collapse')
      ipcRenderer.once('response-get-collapse', (event, value) => {
        commit('changeCollapse', value)
      })
    }
  }
}

export default SideMenu
