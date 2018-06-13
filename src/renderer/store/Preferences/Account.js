import { ipcRenderer } from 'electron'

const Account = {
  namespaced: true,
  state: {
    accounts: [],
    accountLoading: false
  },
  mutations: {
    updateAccounts (state, accounts) {
      state.accounts = accounts
    },
    updateAccountLoading (state, value) {
      state.accountLoading = value
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
    },
    removeAccount ({ commit }, account) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('remove-account', account._id)
        ipcRenderer.once('error-remove-account', (event, err) => {
          ipcRenderer.removeAllListeners('response-remove-account')
          reject(err)
        })
        ipcRenderer.once('response-remove-account', (event) => {
          ipcRenderer.removeAllListeners('error-remove-account')
          resolve()
        })
      })
    },
    forwardAccount ({ commit }, account) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('forward-account', account)
        ipcRenderer.once('error-forward-account', (event, err) => {
          ipcRenderer.removeAllListeners('response-forward-account')
          reject(err)
        })
        ipcRenderer.once('response-forward-account', (event) => {
          ipcRenderer.removeAllListeners('error-forward-account')
          resolve()
        })
      })
    },
    backwardAccount ({ commit }, account) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('backward-account', account)
        ipcRenderer.once('error-backward-account', (event, err) => {
          ipcRenderer.removeAllListeners('response-forward-account')
          reject(err)
        })
        ipcRenderer.once('response-backward-account', (event) => {
          ipcRenderer.removeAllListeners('error-backward-account')
          resolve()
        })
      })
    },
    removeAllAccounts () {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('remove-all-accounts')
        ipcRenderer.once('error-remove-all-accounts', (event, err) => {
          ipcRenderer.removeAllListeners('response-remove-all-accounts')
          reject(err)
        })
        ipcRenderer.once('response-remove-all-accounts', (event) => {
          ipcRenderer.removeAllListeners('error-remove-all-accounts')
          resolve()
        })
      })
    }
  }
}

export default Account
