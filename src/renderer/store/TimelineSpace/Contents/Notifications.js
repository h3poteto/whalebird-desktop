import Mastodon from 'mastodon-api'

const Notifications = {
  namespaced: true,
  state: {
    lazyLoading: false,
    heading: true,
    notifications: [],
    unreadNotifications: []
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
    }
  },
  actions: {
    fetchNotifications ({ commit }, account) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: account.accessToken,
            api_url: account.baseURL + '/api/v1'
          }
        )
        client.get('/notifications', { limit: 30 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateNotifications', data)
          resolve(res)
        })
      })
    },
    lazyFetchNotifications ({ state, commit, rootState }, last) {
      if (last === undefined || last === null) {
        return null
      }
      return new Promise((resolve, reject) => {
        if (state.lazyLoading) {
          return resolve()
        }
        commit('changeLazyLoading', true)
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get('/notifications', { max_id: last.id, limit: 30 }, (err, data, res) => {
          if (err) return reject(err)
          commit('TimelineSpace/insertNotifications', data, { root: true })
          commit('changeLazyLoading', false)
        })
      })
    }
  }
}

export default Notifications
