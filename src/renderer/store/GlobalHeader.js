import { ipcRenderer } from 'electron'
import router from '../router'

const GlobalHeader = {
  namespaced: true,
  state: {
    defaultActive: '0',
    accounts: [],
    changing: false
  },
  mutations: {
    changeDefaultActive (state, index) {
      state.defaultActive = index
    },
    updateAccounts (state, accounts) {
      state.accounts = accounts
    },
    updateChanging (state, value) {
      state.changing = value
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
    refreshAccounts ({ commit, state }) {
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
    watchShortcutEvents ({ state, commit, rootState }) {
      ipcRenderer.on('change-account', (event, account) => {
        if (state.changing) {
          return null
        }
        if (rootState.route.params.id === account._id) {
          return null
        }
        // changing finish after loading
        commit('updateChanging', true)
        commit('changeDefaultActive', account.index.toString())
        router.push(`/${account._id}/home`)
      })
    },
    selectAccount ({ state, commit }, account) {
      commit('updateChanging', true)
      const index = state.accounts.findIndex(a => a._id === account._id)
      commit('changeDefaultActive', index.toString())
      router.push({ path: `/${account._id}/home` })
    },
    async removeShortcutEvents () {
      ipcRenderer.removeAllListeners('change-account')
      return 'removeShortcutEvents'
    },
    schmearMenu ({ commit, state }, id) {
      const index = state.accounts.findIndex((a) => {
        return a._id === id
      })
      if (index !== undefined) {
        commit('changeDefaultActive', index.toString())
      }
    }
  }
}

export default GlobalHeader
