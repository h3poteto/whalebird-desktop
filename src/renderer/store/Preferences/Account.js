import { ipcRenderer } from 'electron'

const Account = {
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
    loadAccounts ({ commit }) {
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
    }
  }
}

export default Account
