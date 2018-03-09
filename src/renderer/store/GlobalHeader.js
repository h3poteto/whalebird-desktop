import { ipcRenderer } from 'electron'

const GlobalHeader = {
  namespaced: true,
  state: {
    instances: []
  },
  mutations: {
    updateInstances (state, instances) {
      state.instances = instances
    }
  },
  actions: {
    listInstances ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('list-instances', 'list')
        ipcRenderer.on('error-list-instances', (event, err) => {
          reject(err)
        })
        ipcRenderer.on('response-list-instances', (event, instances) => {
          commit('updateInstances', instances)
          resolve(instances)
        })
      })
    }
  }
}

export default GlobalHeader
