import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'
import SideMenu from './TimelineSpace/SideMenu'
import router from '../router'

const TimelineSpace = {
  namespaced: true,
  modules: {
    SideMenu
  },
  state: {
    account: {
      domain: '',
      _id: ''
    },
    username: '',
    homeTimeline: [],
    notifications: [],
    newTootModal: false
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
    changeNewTootModal (state, modal) {
      state.newTootModal = modal
    }
  },
  actions: {
    fetchAccount ({ commit }, id) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-local-account', id)
        ipcRenderer.once('error-get-local-account', (event, err) => {
          // TODO: handle error
          console.log(err)
          reject(err)
        })
        ipcRenderer.once('response-get-local-account', (event, account) => {
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
      ipcRenderer.send('start-user-streaming', account)
      ipcRenderer.once('error-start-userstreaming', (event, err) => {
        console.log(err)
      })
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
    },
    stopUserStreaming ({ commit }) {
      ipcRenderer.send('stop-user-streaming')
    },
    watchShortcutEvents ({ commit }, account) {
      ipcRenderer.on('CmdOrCtrl+N', () => {
        commit('changeNewTootModal', true)
      })
      ipcRenderer.on('CmdOrCtrl+R', () => {
        console.log('reply')
      })
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
    postToot ({ commit, state }, body) {
      return new Promise((resolve, reject) => {
        if (state.account.accessToken === undefined || state.account.accessToken === null) {
          return reject(new AuthenticationError())
        }
        const client = new Mastodon(
          {
            access_token: state.account.accessToken,
            api_url: state.account.baseURL + '/api/v1'
          }
        )
        client.post('/statuses', {
          status: body
        }, (err, data, res) => {
          if (err) return reject(err)
          commit('changeNewTootModal', false)
          resolve(res)
        })
      })
    }
  }
}

export default TimelineSpace

class AuthenticationError {}

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
