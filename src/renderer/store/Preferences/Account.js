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
    removeAccount (_, account) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('remove-account', account._id)
        ipcRenderer.once('error-remove-account', (_, err) => {
          ipcRenderer.removeAllListeners('response-remove-account')
          reject(err)
        })
        ipcRenderer.once('response-remove-account', () => {
          ipcRenderer.removeAllListeners('error-remove-account')
          resolve()
        })
      })
    },
    forwardAccount (_, account) {
      console.log(account)
      return new Promise((resolve, reject) => {
        ipcRenderer.send('forward-account', account)
        ipcRenderer.once('error-forward-account', (_, err) => {
          ipcRenderer.removeAllListeners('response-forward-account')
          reject(err)
        })
        ipcRenderer.once('response-forward-account', () => {
          ipcRenderer.removeAllListeners('error-forward-account')
          resolve()
        })
      })
    },
    backwardAccount (_, account) {
      console.log(account)
      return new Promise((resolve, reject) => {
        ipcRenderer.send('backward-account', account)
        ipcRenderer.once('error-backward-account', (event, err) => {
          ipcRenderer.removeAllListeners('response-forward-account')
          reject(err)
        })
        ipcRenderer.once('response-backward-account', () => {
          ipcRenderer.removeAllListeners('error-backward-account')
          resolve()
        })
      })
    },
    removeAllAccounts () {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('remove-all-accounts')
        ipcRenderer.once('error-remove-all-accounts', (_, err) => {
          ipcRenderer.removeAllListeners('response-remove-all-accounts')
          reject(err)
        })
        ipcRenderer.once('response-remove-all-accounts', () => {
          ipcRenderer.removeAllListeners('error-remove-all-accounts')
          resolve()
        })
      })
    }
  }
}

export default Account
