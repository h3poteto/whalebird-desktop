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
        ipcRenderer.on('empty-instances', (event, err) => {
          reject(err)
        })
        ipcRenderer.on('instances', (event, instances) => {
          commit('updateInstances', instances)
          resolve(instances)
        })
      })
    }
  }
}

export default GlobalHeader
