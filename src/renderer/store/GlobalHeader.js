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
    listAccounts ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('list-accounts', 'list')
        ipcRenderer.once('error-list-accounts', (event, err) => {
          ipcRenderer.removeAllListeners('response-list-accounts')
          reject(err)
        })
        ipcRenderer.once('response-list-accounts', (event, accounts) => {
          ipcRenderer.removeAllListeners('error-list-accounts')
          commit('updateAccounts', accounts)
          resolve(accounts)
        })
      })
    },
    watchShortcutEvents ({ state, commit }) {
      ipcRenderer.on('change-account', (event, account) => {
        if (state.changing) {
          return null
        }
        // changing finish after loading
        commit('updateChanging', true)
        commit('changeDefaultActive', account.index.toString())
        router.push(`/${account._id}/home`)
      })
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
