import { ipcRenderer } from 'electron'

export default {
  namespaced: true,
  state: {
    notification: {
      notify: {
        reply: true,
        reblog: true,
        favourite: true,
        follow: true
      }
    }
  },
  mutations: {
    updateNotification (state, notification) {
      state.notification = notification
    }
  },
  actions: {
    loadNotification ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-preferences')
        ipcRenderer.once('error-get-preferences', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-preferences')
          reject(err)
        })
        ipcRenderer.once('response-get-preferences', (event, conf) => {
          ipcRenderer.removeAllListeners('error-get-preferences')
          commit('updateNotification', conf.notification)
          resolve(conf)
        })
      })
    },
    updateNotify ({ commit, state, dispatch }, notify) {
      const newNotify = Object.assign({}, state.notification.notify, notify)
      const newNotification = Object.assign({}, state.notification, {
        notify: newNotify
      })
      const config = {
        notification: newNotification
      }
      return new Promise(resolve => {
        ipcRenderer.send('update-preferences', config)
        ipcRenderer.once('response-update-preferences', (event, conf) => {
          commit('updateNotification', conf.notification)
          dispatch('App/loadPreferences', null, { root: true })
          resolve(conf.notification)
        })
      })
    }
  }
}
