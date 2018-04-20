import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'
import SideMenu from './TimelineSpace/SideMenu'
import HeaderMenu from './TimelineSpace/HeaderMenu'
import Modals from './TimelineSpace/Modals'
import Contents from './TimelineSpace/Contents'
import router from '../router'

const TimelineSpace = {
  namespaced: true,
  modules: {
    SideMenu,
    HeaderMenu,
    Modals,
    Contents
  },
  state: {
    account: {
      domain: '',
      _id: '',
      username: ''
    }
  },
  mutations: {
    updateAccount (state, account) {
      state.account = account
    }
  },
  actions: {
    localAccount ({ dispatch, commit }, id) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-local-account', id)
        ipcRenderer.once('error-get-local-account', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-local-account')
          reject(err)
        })
        ipcRenderer.once('response-get-local-account', (event, account) => {
          ipcRenderer.removeAllListeners('error-get-local-account')

          if (account.username === undefined || account.username === null || account.username === '') {
            dispatch('fetchAccount', account)
              .then((acct) => {
                commit('updateAccount', acct)
                resolve(acct)
              })
              .catch((err) => {
                reject(err)
              })
          } else {
            commit('updateAccount', account)
            resolve(account)
          }
        })
      })
    },
    fetchAccount ({ commit }, account) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: account.accessToken,
            api_url: account.baseURL + '/api/v1'
          })
        client.get('/accounts/verify_credentials', (err, data, res) => {
          if (err) return reject(err)
          ipcRenderer.send('update-account', Object.assign(account, {
            username: data.username,
            accountId: data.id
          }))
          ipcRenderer.once('error-update-account', (event, err) => {
            ipcRenderer.removeAllListeners('response-update-account')
            reject(err)
          })
          ipcRenderer.once('response-update-account', (event, account) => {
            ipcRenderer.removeAllListeners('error-update-account')
            resolve(account)
          })
        })
      })
    },
    startUserStreaming ({ state, commit }, account) {
      ipcRenderer.on('update-start-user-streaming', (event, update) => {
        commit('TimelineSpace/Contents/Home/appendTimeline', update, { root: true })
        // Sometimes archive old statuses
        if (state.heading) {
          commit('TimelineSpace/Contents/Home/archiveTimeline', null, { root: true })
        }
        commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', true, { root: true })
      })
      ipcRenderer.on('notification-start-user-streaming', (event, notification) => {
        let notify = buildNotification(notification)
        notify.onclick = () => {
          router.push(`/${account._id}/notifications`)
        }
        commit('TimelineSpace/Contents/Notifications/appendNotifications', notification, { root: true })
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
        commit('TimelineSpace/Modals/Jump/changeModal', true, { root: true })
      })
    },
    async removeShortcutEvents () {
      ipcRenderer.removeAllListeners('CmdOrCtrl+N')
      ipcRenderer.removeAllListeners('CmdOrCtrl+K')
      return 'removeShortcutEvents'
    },
    async clearAccount ({ commit }) {
      commit(
        'updateAccount',
        {
          domain: '',
          _id: '',
          username: ''
        }
      )
      return 'clearAccount'
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
      // Clean html tags
      return new Notification(`${notification.status.account.display_name}`, {
        body: `${notification.status.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')}`
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
