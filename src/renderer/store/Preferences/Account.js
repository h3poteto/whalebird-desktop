import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'

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
    mergeAccounts (state, accounts) {
      // TODO: Save username in local db after authorize.
      // This function can not support if user add multiple accounts which are exist in same domain.
      // So when username is saved in local db, please compare with reference to username@domain.
      state.accounts = state.accounts.map((a) => {
        let account = a
        accounts.map((acct) => {
          if (acct.domain === a.domain) {
            account = acct
          }
        })
        return account
      })
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
    fetchUsername ({ dispatch, commit }, accounts) {
      return new Promise((resolve, reject) => {
        dispatch('fetchAllAccounts', accounts)
          .then((accounts) => {
            commit('mergeAccounts', accounts)
            resolve(accounts)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    fetchAllAccounts ({ commit }, accounts) {
      return Promise.all(accounts.map((account) => {
        return new Promise((resolve, reject) => {
          const client = new Mastodon(
            {
              access_token: account.accessToken,
              api_url: account.baseURL + '/api/v1'
            })
          client.get('/accounts/verify_credentials', (err, data, res) => {
            if (err) return reject(err)
            // The response doesn't have domain, so I cann't confirm that response and account is same.
            // Therefore I merge account.
            resolve(Object.assign(data, account))
          })
        })
      }))
    }
  }
}

export default Account
