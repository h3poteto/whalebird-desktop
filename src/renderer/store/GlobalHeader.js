import { ipcRenderer } from 'electron'
import router from '@/router'

const GlobalHeader = {
  namespaced: true,
  state: {
    accounts: [],
    changing: false,
    hide: false
  },
  mutations: {
    updateAccounts (state, accounts) {
      state.accounts = accounts
    },
    updateChanging (state, value) {
      state.changing = value
    },
    changeHide (state, value) {
      state.hide = value
    }
  },
  actions: {
    listAccounts ({ dispatch, commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('list-accounts', 'list')
        ipcRenderer.once('error-list-accounts', (event, err) => {
          ipcRenderer.removeAllListeners('response-list-accounts')
          reject(err)
        })
        ipcRenderer.once('response-list-accounts', (event, accounts) => {
          ipcRenderer.removeAllListeners('error-list-accounts')
          commit('updateAccounts', accounts)
          dispatch('refreshAccounts')
          resolve(accounts)
        })
      })
    },
    // Fetch account informations and save current state when GlobalHeader is displayed
    refreshAccounts ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('refresh-accounts')
        ipcRenderer.once('error-refresh-accounts', (event, err) => {
          ipcRenderer.removeAllListeners('response-refresh-accounts')
          reject(err)
        })
        ipcRenderer.once('response-refresh-accounts', (event, accounts) => {
          ipcRenderer.removeAllListeners('error-refresh-accounts')
          commit('updateAccounts', accounts)
          resolve(accounts)
        })
      })
    },
    watchShortcutEvents ({ state, commit, rootState, rootGetters }) {
      ipcRenderer.on('change-account', (event, account) => {
        if (state.changing) {
          return null
        }
        if (rootState.route.params.id === account._id) {
          return null
        }
        // When the modal window is active, don't change account
        if (rootGetters['TimelineSpace/Modals/modalOpened']) {
          return null
        }
        // changing finish after loading
        commit('updateChanging', true)
        router.push(`/${account._id}/home`)
      })
    },
    async removeShortcutEvents () {
      ipcRenderer.removeAllListeners('change-account')
      return true
    },
    loadHide ({ commit }) {
      return new Promise(resolve => {
        ipcRenderer.send('get-global-header')
        ipcRenderer.once('response-get-global-header', (event, value) => {
          commit('changeHide', value)
          resolve(value)
        })
      })
    },
    switchHide ({ dispatch }, value) {
      return new Promise(resolve => {
        ipcRenderer.send('change-global-header', value)
        ipcRenderer.once('response-change-global-header', () => {
          dispatch('loadHide')
          resolve(true)
        })
      })
    }
  }
}

export default GlobalHeader
