import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'
import SideMenu from './TimelineSpace/SideMenu'

const TimelineSpace = {
  namespaced: true,
  modules: {
    SideMenu
  },
  state: {
    account: {
      domain: '',
      id: ''
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
        client.get('/accounts/verify_credentials', {})
          .then((res) => {
            commit('updateUsername', res.data.username)
            resolve(res)
          })
      })
    },
    startUserStreaming ({ commit }, account) {
      ipcRenderer.send('start-user-streaming', account)
      // TODO: when get notification, create notify and display badge in sidemenu
      ipcRenderer.once('error-start-userstreaming', (event, err) => {
        console.log(err)
      })
      ipcRenderer.on('update-start-user-streaming', (event, update) => {
        commit('appendHomeTimeline', update)
      })
      ipcRenderer.on('notification-start-user-streaming', (event, notification) => {
        commit('appendNotifications', notification)
      })
    },
    stopUserStreaming ({ commit }) {
      ipcRenderer.send('stop-user-streaming')
    },
    watchShortcutEvents ({ commit }, account) {
      ipcRenderer.on('CmdOrCtrl+N', () => {
        console.log('new toot')
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
        client.get('/timelines/home', { limit: 40 })
          .then((res) => {
            commit('insertHomeTimeline', res.data)
            resolve()
          })
          .catch((err) => {
            reject(err)
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
        client.get('/notifications', { limit: 30 })
          .then((res) => {
            commit('insertNotifications', res.data)
            resolve()
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  }
}

export default TimelineSpace
