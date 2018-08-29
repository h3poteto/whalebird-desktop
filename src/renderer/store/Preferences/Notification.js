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
    updateNotify ({ commit, state }, notify) {
      const newNotify = Object.assign({}, state.notification.notify, notify)
      const newNotification = Object.assign({}, state.notification, {
        notify: newNotify
      })
      const config = {
        notification: newNotification
      }
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('response-update-preferences', (event, conf) => {
        commit('updateNotification', conf.notification)
      })
    }
  }
}
