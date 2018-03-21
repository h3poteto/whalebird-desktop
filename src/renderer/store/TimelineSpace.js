import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'
import SideMenu from './TimelineSpace/SideMenu'
import Favourites from './TimelineSpace/Favourites'
import Local from './TimelineSpace/Local'
import Public from './TimelineSpace/Public'
import Cards from './TimelineSpace/Cards'
import NewTootModal from './TimelineSpace/NewTootModal'
import router from '../router'

const TimelineSpace = {
  namespaced: true,
  modules: {
    SideMenu,
    Favourites,
    Local,
    Public,
    Cards,
    NewTootModal
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
    appendNotifications (state, notifications) {
      state.notifications = [notifications].concat(state.notifications)
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
      })
      ipcRenderer.on('notification-start-user-streaming', (event, notification) => {
        let notify = buildNotification(notification)
        notify.onclick = () => {
          router.push(`/${account._id}/notifications`)
        }
        commit('appendNotifications', notification)
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
        commit('TimelineSpace/NewTootModal/changeModal', true, { root: true })
      })
      ipcRenderer.on('CmdOrCtrl+R', () => {
        // TODO: reply window
        console.log('reply')
      })
    },
    async removeShortcutEvents () {
      ipcRenderer.removeAllListeners('CmdOrCtrl+N')
      ipcRenderer.removeAllListeners('CmdOrCtrl+R')
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
          commit('insertHomeTimeline', data)
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
          commit('insertNotifications', data)
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
        body: `${notification.account.display_name} favourited your status`
      })
    case 'follow':
      return new Notification('Follow', {
        body: `${notification.account.display_name} is now following you`
      })
    case 'mention':
      return new Notification(`${notification.status.account.display_name}`, {
        body: `${notification.status.content}`
      })
    case 'reblog':
      return new Notification('Reblog', {
        body: `${notification.account.display_name} boosted your status`
      })
  }
}
