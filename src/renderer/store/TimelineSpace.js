import { ipcRenderer } from 'electron'
import Mastodon from 'megalodon'
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
    },
    loading: false,
    emojis: [],
    tootMax: 500,
    unreadNotification: {
      direct: false,
      local: true,
      public: false
    }
  },
  mutations: {
    updateAccount (state, account) {
      state.account = account
    },
    changeLoading (state, value) {
      state.loading = value
    },
    updateEmojis (state, emojis) {
      state.emojis = emojis.map((e) => {
        return {
          name: `:${e.shortcode}:`,
          image: e.url
        }
      })
    },
    updateTootMax (state, value) {
      if (value) {
        state.tootMax = value
      } else {
        state.tootMax = 500
      }
    },
    updateUnreadNotification (state, settings) {
      state.unreadNotification = settings
    }
  },
  actions: {
    // -------------------------------------------------
    // Accounts
    // -------------------------------------------------
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
        ipcRenderer.send('update-account', account)
        ipcRenderer.once('error-update-account', (event, err) => {
          ipcRenderer.removeAllListeners('response-update-account')
          reject(err)
        })
        ipcRenderer.once('response-update-account', (event, account) => {
          ipcRenderer.removeAllListeners('error-update-account')
          resolve(account)
        })
      })
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
    },
    // -----------------------------------------------
    // Shortcuts
    // -----------------------------------------------
    watchShortcutEvents ({ commit, dispatch }) {
      ipcRenderer.on('CmdOrCtrl+N', () => {
        dispatch('TimelineSpace/Modals/NewToot/openModal', {}, { root: true })
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
    /**
     * clearUnread
     */
    async clearUnread ({ dispatch }) {
      dispatch('TimelineSpace/SideMenu/clearUnread', {}, { root: true })
    },
    /**
     * fetchEmojis
     */
    async fetchEmojis ({ commit }, account) {
      const data = await Mastodon.get('/custom_emojis', {}, account.baseURL + '/api/v1')
      commit('updateEmojis', data)
      return data
    },
    /**
     * fetchInstance
     */
    async fetchInstance ({ commit }, account) {
      const data = await Mastodon.get('/instance', {}, account.baseURL + '/api/v1')
      commit('updateTootMax', data.max_toot_chars)
      return data
    },
    loadUnreadNotification ({ commit, rootState }, accountID) {
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
        ipcRenderer.send('get-unread-notification', accountID)
      })
    },
    async fetchContentsTimelines ({ dispatch, state }, account) {
      await dispatch('TimelineSpace/Contents/Home/fetchTimeline', account, { root: true })
      await dispatch('TimelineSpace/Contents/Notifications/fetchNotifications', account, { root: true })
      if (state.unreadNotification.direct) {
        await dispatch('TimelineSpace/Contents/DirectMessages/fetchTimeline', {}, { root: true })
      }
      if (state.unreadNotification.local) {
        await dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', {}, { root: true })
      }
      if (state.unreadNotification.public) {
        await dispatch('TimelineSpace/Contents/Public/fetchPublicTimeline', {}, { root: true })
      }
    },
    clearContentsTimelines ({ commit }) {
      commit('TimelineSpace/Contents/Home/clearTimeline', {}, { root: true })
      commit('TimelineSpace/Contents/Local/clearTimeline', {}, { root: true })
      commit('TimelineSpace/Contents/DirectMessages/clearTimeline', {}, { root: true })
      commit('TimelineSpace/Contents/Notifications/clearNotifications', {}, { root: true })
      commit('TimelineSpace/Contents/Public/clearTimeline', {}, { root: true })
    },
    bindStreamings ({ dispatch, state }, account) {
      dispatch('bindUserStreaming', account)
      if (state.unreadNotification.direct) {
        dispatch('bindDirectMessagesStreaming')
      }
      if (state.unreadNotification.local) {
        dispatch('bindLocalStreaming')
      }
      if (state.unreadNotification.public) {
        dispatch('bindPublicStreaming')
      }
    },
    startStreamings ({ dispatch, state }, account) {
      dispatch('startUserStreaming', account)
      if (state.unreadNotification.direct) {
        dispatch('startDirectMessagesStreaming')
      }
      if (state.unreadNotification.local) {
        dispatch('startLocalStreaming')
      }
      if (state.unreadNotification.public) {
        dispatch('startPublicStreaming')
      }
    },
    stopStreamings ({ dispatch }, account) {
      dispatch('stopUserStreaming')
      dispatch('stopDirectMessagesStreaming')
      dispatch('stopLocalStreaming')
      dispatch('stopPublicStreaming')
      dispatch('unbindUserStreaming')
      dispatch('unbindDirectMessagesStreaming')
      dispatch('unbindLocalStreaming')
      dispatch('unbindPublicStreaming')
    },
    // ------------------------------------------------
    // Each streaming methods
    // ------------------------------------------------
    bindUserStreaming ({ commit, rootState }, account) {
      ipcRenderer.on('update-start-user-streaming', (event, update) => {
        commit('TimelineSpace/Contents/Home/appendTimeline', update, { root: true })
        // Sometimes archive old statuses
        if (rootState.TimelineSpace.Contents.Home.heading && Math.random() > 0.8) {
          commit('TimelineSpace/Contents/Home/archiveTimeline', null, { root: true })
        }
        commit('TimelineSpace/SideMenu/changeUnreadHomeTimeline', true, { root: true })
      })
      ipcRenderer.on('notification-start-user-streaming', (event, notification) => {
        let notify = createNotification(notification, rootState.App.notify)
        if (notify) {
          notify.onclick = () => {
            router.push(`/${account._id}/notifications`)
          }
        }
        commit('TimelineSpace/Contents/Notifications/appendNotifications', notification, { root: true })
        if (rootState.TimelineSpace.Contents.Notifications.heading && Math.random() > 0.8) {
          commit('TimelineSpace/Contents/Notifications/archiveNotifications', null, { root: true })
        }
        commit('TimelineSpace/SideMenu/changeUnreadNotifications', true, { root: true })
      })
    },
    startUserStreaming (_, account) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-user-streaming', account)
        ipcRenderer.once('error-start-user-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    bindLocalStreaming ({ commit, rootState }) {
      ipcRenderer.on('update-start-local-streaming', (event, update) => {
        commit('TimelineSpace/Contents/Local/appendTimeline', update, { root: true })
        if (rootState.TimelineSpace.Contents.Local.heading && Math.random() > 0.8) {
          commit('TimelineSpace/Contents/Local/archiveTimeline', {}, { root: true })
        }
        commit('TimelineSpace/SideMenu/changeUnreadLocalTimeline', true, { root: true })
      })
    },
    startLocalStreaming ({ state }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-local-streaming', state.account)
        ipcRenderer.once('error-start-local-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    bindPublicStreaming ({ commit, rootState }) {
      ipcRenderer.on('update-start-public-streaming', (event, update) => {
        commit('TimelineSpace/Contents/Public/appendTimeline', update, { root: true })
        if (rootState.TimelineSpace.Contents.Public.heading && Math.random() > 0.8) {
          commit('TimelineSpace/Contents/Public/archiveTimeline')
        }
      })
      commit('TimelineSpace/SideMenu/changeUnreadPublicTimeline', true, { root: true })
    },
    startPublicStreaming ({ state }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-public-streaming', state.account)
        ipcRenderer.once('error-start-public-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    bindDirectMessagesStreaming ({ commit, rootState }) {
      ipcRenderer.on('update-start-directmessages-streaming', (event, update) => {
        commit('TimelineSpace/Contents/DirectMessages/appendTimeline', update, { root: true })
        if (rootState.TimelineSpace.Contents.DirectMessages.heading && Math.random() > 0.8) {
          commit('TimelineSpace/Contents/DirectMessages/archiveTimeline', {}, { root: true })
        }
        commit('TimelineSpace/SideMenu/changeUnreadDirectMessagesTimeline', true, { root: true })
      })
    },
    startDirectMessagesStreaming ({ state }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('start-directmessages-streaming', state.account)
        ipcRenderer.once('error-start-directmessages-streaming', (event, err) => {
          reject(err)
        })
      })
    },
    unbindUserStreaming () {
      ipcRenderer.removeAllListeners('update-start-user-streaming')
      ipcRenderer.removeAllListeners('notification-start-user-streaming')
      ipcRenderer.removeAllListeners('error-start-user-streaming')
    },
    stopUserStreaming () {
      ipcRenderer.send('stop-user-streaming')
    },
    unbindLocalStreaming () {
      ipcRenderer.removeAllListeners('error-start-local-streaming')
      ipcRenderer.removeAllListeners('update-start-local-streaming')
    },
    stopLocalStreaming () {
      ipcRenderer.send('stop-local-streaming')
    },
    unbindPublicStreaming () {
      ipcRenderer.removeAllListeners('error-start-public-streaming')
      ipcRenderer.removeAllListeners('update-start-public-streaming')
    },
    stopPublicStreaming () {
      ipcRenderer.send('stop-public-streaming')
    },
    unbindDirectMessagesStreaming () {
      ipcRenderer.removeAllListeners('error-start-directmessages-streaming')
      ipcRenderer.removeAllListeners('update-start-directmessages-streaming')
    },
    stopDirectMessagesStreaming () {
      ipcRenderer.send('stop-drectmessages-streaming')
    }
  }
}

export default TimelineSpace

function createNotification (notification, notifyConfig) {
  switch (notification.type) {
    case 'favourite':
      if (notifyConfig.favourite) {
        return new Notification('Favourite', {
          body: `${username(notification.account)} favourited your status`
        })
      }
      break
    case 'follow':
      if (notifyConfig.follow) {
        return new Notification('Follow', {
          body: `${username(notification.account)} is now following you`
        })
      }
      break
    case 'mention':
      if (notifyConfig.reply) {
        // Clean html tags
        return new Notification(`${notification.status.account.display_name}`, {
          body: `${notification.status.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')}`
        })
      }
      break
    case 'reblog':
      if (notifyConfig.reblog) {
        return new Notification('Reblog', {
          body: `${username(notification.account)} boosted your status`
        })
      }
      break
  }
}

function username (account) {
  if (account.display_name !== '') {
    return account.display_name
  } else {
    return account.username
  }
}
