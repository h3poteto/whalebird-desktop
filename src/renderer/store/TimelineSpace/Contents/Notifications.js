import { ipcRenderer } from 'electron'
import Mastodon from 'megalodon'

const Notifications = {
  namespaced: true,
  state: {
    lazyLoading: false,
    heading: true,
    notifications: [],
    unreadNotifications: [],
    filter: ''
  },
  mutations: {
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    },
    changeHeading (state, value) {
      state.heading = value
    },
    appendNotifications (state, notification) {
      if (state.heading) {
        state.notifications = [notification].concat(state.notifications)
      } else {
        state.unreadNotifications = [notification].concat(state.unreadNotifications)
      }
    },
    updateNotifications (state, notifications) {
      state.notifications = notifications
    },
    mergeNotifications (state) {
      state.notifications = state.unreadNotifications.concat(state.notifications)
      state.unreadNotifications = []
    },
    insertNotifications (state, notifications) {
      state.notifications = state.notifications.concat(notifications)
    },
    updateToot (state, message) {
      state.notifications = state.notifications.map((notification) => {
        // I want to update toot only mention.
        // Because Toot component don't use status information when other patterns.
        if (notification.type === 'mention' && notification.status.id === message.id) {
          const status = {
            status: message
          }
          return Object.assign(notification, status)
        } else {
          return notification
        }
      })
    },
    clearNotifications (state) {
      state.notifications = []
    },
    archiveNotifications (state) {
      state.notifications = state.notifications.slice(0, 30)
    },
    changeFilter (state, filter) {
      state.filter = filter
    }
  },
  actions: {
    fetchNotifications ({ commit }, account) {
      const client = new Mastodon(
        account.accessToken,
        account.baseURL + '/api/v1'
      )
      return client.get('/notifications', { limit: 30 })
        .then(data => {
          commit('updateNotifications', data)
          return data
        })
    },
    lazyFetchNotifications ({ state, commit, rootState }, last) {
      if (last === undefined || last === null) {
        return Promise.resolve(null)
      }
      if (state.lazyLoading) {
        return Promise.resolve(null)
      }
      commit('changeLazyLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/notifications', { max_id: last.id, limit: 30 })
        .then(data => {
          commit('changeLazyLoading', false)
          commit('insertNotifications', data)
          return data
        })
        .catch(err => {
          commit('changeLazyLoading', false)
          throw err
        })
    },
    resetBadge () {
      ipcRenderer.send('reset-badge')
    }
  }
}

export default Notifications
