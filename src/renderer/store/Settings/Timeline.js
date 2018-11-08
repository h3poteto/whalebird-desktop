import { ipcRenderer } from 'electron'

export default {
  namespaced: true,
  state: {
    unreadNotification: {
      direct: false,
      local: true,
      public: false
    }
  },
  mutations: {
    updateUnreadNotification (state, settings) {
      state.unreadNotification = settings
    }
  },
  actions: {
    loadUnreadNotification ({ commit, rootState }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.once('response-get-unread-notification', (event, settings) => {
          ipcRenderer.removeAllListeners('error-get-unread-notification')
          commit('updateUnreadNotification', settings)
          resolve(settings)
        })
        ipcRenderer.once('error-get-unread-notification', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-unread-notification')
          resolve(null)
        })
        ipcRenderer.send('get-unread-notification', rootState.Settings.accountID)
      })
    },
    changeUnreadNotification ({ dispatch, state, rootState }, timeline) {
      const settings = Object.assign({}, state.unreadNotification, timeline, {
        accountID: rootState.Settings.accountID
      })
      return new Promise((resolve, reject) => {
        ipcRenderer.once('response-update-unread-notification', (event, _) => {
          ipcRenderer.removeAllListeners('error-update-unread-notification')
          dispatch('loadUnreadNotification')
          resolve(settings)
        })
        ipcRenderer.once('error-update-unread-notification', (event, err) => {
          ipcRenderer.removeAllListeners('response-update-unread-notification')
          reject(err)
        })
        ipcRenderer.send('update-unread-notification', settings)
      })
    }
  }
}
