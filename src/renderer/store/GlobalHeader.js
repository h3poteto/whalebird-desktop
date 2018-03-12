import { ipcRenderer } from 'electron'

const GlobalHeader = {
  namespaced: true,
  state: {
    accounts: []
  },
  mutations: {
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
    }
  }
}

export default GlobalHeader
