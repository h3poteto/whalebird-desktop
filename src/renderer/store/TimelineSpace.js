import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'
import SideMenu from './TimelineSpace/SideMenu'
import JumpModal from './TimelineSpace/JumpModal'
import Modals from './TimelineSpace/Modals'
import Contents from './TimelineSpace/Contents'
import router from '../router'

const TimelineSpace = {
  namespaced: true,
  modules: {
    SideMenu,
    JumpModal,
    Modals,
    Contents
  },
  state: {
    account: {
      domain: '',
      _id: ''
    },
    username: '',
    homeTimeline: [],
    notifications: []
  },
  mutations: {
    updateAccount (state, account) {
      state.account = account
    },
    updateUsername (state, username) {
      state.username = username
    },
    appendHomeTimeline (state, update) {
      state.homeTimeline = [update].concat(state.homeTimeline)
    },
    appendNotifications (state, notification) {
      state.notifications = [notification].concat(state.notifications)
    },
    updateHomeTimeline (state, messages) {
      state.homeTimeline = messages
    },
    updateNotifications (state, notifications) {
      state.notifications = notifications
    },
    insertHomeTimeline (state, messages) {
      state.homeTimeline = state.homeTimeline.concat(messages)
    },
    insertNotifications (state, notifications) {
      state.notifications = state.notifications.concat(notifications)
    },
    updateToot (state, message) {
      // Replace target message in homeTimeline and notifications
      state.homeTimeline = state.homeTimeline.map((toot) => {
        if (toot.id === message.id) {
          return message
        } else if (toot.reblog !== null && toot.reblog.id === message.id) {
          // When user reblog/favourite a reblogged toot, target message is a original toot.
          // So, a message which is received now is original toot.
          const reblog = {
            reblog: message
          }
          return Object.assign(toot, reblog)
        } else {
          return toot
        }
      })

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
    clearTimeline (state) {
      state.homeTimeline = []
    },
    clearNotifications (state) {
      state.notifications = []
    },
    archiveHomeTimeline (state) {
      state.homeTimeline = state.homeTimeline.slice(0, 40)
    },
    archiveNotifications (state) {
      state.notifications = state.notifications.slice(0, 40)
    }
  },
  actions: {
    fetchAccount ({ commit }, id) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-local-account', id)
        ipcRenderer.once('error-get-local-account', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-local-account')
          reject(err)
        })
        ipcRenderer.once('response-get-local-account', (event, account) => {
          ipcRenderer.removeAllListeners('error-get-local-account')
          commit('updateAccount', account)
          resolve(account)
        })
      })
    },
    username ({ commit }, account) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: account.accessToken,
            api_url: account.baseURL + '/api/v1'
          })
        client.get('/accounts/verify_credentials', (err, data, res) => {
          if (err) return reject(err)
          commit('updateUsername', data.username)
          resolve(res)
        })
      })
    },
    startUserStreaming ({ commit }, account) {
      ipcRenderer.on('update-start-user-streaming', (event, update) => {
        commit('appendHomeTimeline', update)
        commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', true, { root: true })
      })
      ipcRenderer.on('notification-start-user-streaming', (event, notification) => {
        let notify = buildNotification(notification)
        notify.onclick = () => {
          router.push(`/${account._id}/notifications`)
        }
        commit('appendNotifications', notification)
        commit('TimelineSpace/SideMenu/changeUnreadNotifications', true, { root: true })
      })

      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-user-streaming', account)
        ipcRenderer.once('error-start-user-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    async stopUserStreaming ({ commit }) {
      ipcRenderer.removeAllListeners('update-start-user-streaming')
      ipcRenderer.removeAllListeners('notification-start-user-streaming')
      ipcRenderer.removeAllListeners('error-start-user-streaming')
      ipcRenderer.send('stop-user-streaming')
      return 'stopUserStreaming'
    },
    watchShortcutEvents ({ commit }) {
      ipcRenderer.on('CmdOrCtrl+N', () => {
        commit('TimelineSpace/Modals/NewToot/changeModal', true, { root: true })
      })
      ipcRenderer.on('CmdOrCtrl+K', () => {
        commit('TimelineSpace/JumpModal/changeModal', true, { root: true })
      })
    },
    async removeShortcutEvents () {
      ipcRenderer.removeAllListeners('CmdOrCtrl+N')
      ipcRenderer.removeAllListeners('CmdOrCtrl+K')
      return 'removeShortcutEvents'
    },
    fetchHomeTimeline ({ commit }, account) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: account.accessToken,
            api_url: account.baseURL + '/api/v1'
          }
        )
        client.get('/timelines/home', { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateHomeTimeline', data)
          resolve(res)
        })
      })
    },
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
    async clearTimeline ({ commit }) {
      commit('clearTimeline')
      return 'clearTimeline'
    },
    async clearNotifications ({ commit }) {
      commit('clearNotifications')
      return 'clearNotifications'
    },
    async clearAccount ({ commit }) {
      commit(
        'updateAccount',
        {
          domain: '',
          _id: ''
        }
      )
      return 'clearAccount'
    },
    async clearUsername ({ commit }) {
      commit('updateUsername', '')
      return 'clearUsername'
    }
  }
}

export default TimelineSpace

function buildNotification (notification) {
  switch (notification.type) {
    case 'favourite':
      return new Notification('Favourite', {
        body: `${username(notification.account)} favourited your status`
      })
    case 'follow':
      return new Notification('Follow', {
        body: `${username(notification.account)} is now following you`
      })
    case 'mention':
      return new Notification(`${notification.status.account.display_name}`, {
        body: `${notification.status.content}`
      })
    case 'reblog':
      return new Notification('Reblog', {
        body: `${username(notification.account)} boosted your status`
      })
  }
}

function username (account) {
  if (account.display_name !== '') {
    return account.display_name
  } else {
    return account.username
  }
}
