import { ipcRenderer } from 'electron'
import router from '../router'

const GlobalHeader = {
  namespaced: true,
  state: {
    defaultActive: '0',
    accounts: []
  },
  mutations: {
    changeDefaultActive (state, index) {
      state.defaultActive = index
    },
    updateAccounts (state, accounts) {
      state.accounts = accounts
    }
  },
  actions: {
    listAccounts ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('list-accounts', 'list')
        ipcRenderer.once('error-list-accounts', (event, err) => {
          reject(err)
        })
        ipcRenderer.once('response-list-accounts', (event, accounts) => {
          commit('updateAccounts', accounts)
          resolve(accounts)
        })
      })
    },
    watchShortcutEvents ({ commit }) {
      ipcRenderer.on('change-account', (event, account) => {
        router.push(`/${account._id}/home`)
        commit('changeDefaultActive', account.index.toString())
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
