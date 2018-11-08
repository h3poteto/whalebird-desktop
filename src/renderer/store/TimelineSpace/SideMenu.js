import Mastodon from 'megalodon'
import { ipcRenderer } from 'electron'

const SideMenu = {
  namespaced: true,
  state: {
    unreadHomeTimeline: false,
    unreadNotifications: false,
    unreadLocalTimeline: false,
    unreadDirectMessagesTimeline: false,
    unreadPublicTimeline: false,
    lists: [],
    tags: [],
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
    changeUnreadDirectMessagesTimeline (state, value) {
      state.unreadDirectMessagesTimeline = value
    },
    changeUnreadPublicTimeline (state, value) {
      state.unreadPublicTimeline = value
    },
    updateLists (state, lists) {
      state.lists = lists
    },
    changeCollapse (state, collapse) {
      state.collapse = collapse
    },
    updateTags (state, tags) {
      state.tags = tags
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
      commit('changeUnreadDirectMessagesTimeline', false)
      commit('changeUnreadPublicTimeline', false)
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
    },
    listTags ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.once('response-list-hashtags', (event, tags) => {
          ipcRenderer.removeAllListeners('error-list-hashtags')
          commit('updateTags', tags)
          resolve(tags)
        })
        ipcRenderer.once('error-list-hashtags', (event, err) => {
          ipcRenderer.removeAlListeners('response-list-hashtags')
          reject(err)
        })
        ipcRenderer.send('list-hashtags')
      })
    }
  }
}

export default SideMenu
