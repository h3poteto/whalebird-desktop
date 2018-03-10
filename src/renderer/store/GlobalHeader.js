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
    listInstances ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('list-instances', 'list')
        ipcRenderer.once('error-list-instances', (event, err) => {
          reject(err)
        })
        ipcRenderer.once('response-list-instances', (event, instances) => {
          commit('updateAccounts', instances)
          resolve(instances)
        })
      })
    }
  }
}

export default GlobalHeader
