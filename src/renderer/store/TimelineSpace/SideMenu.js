import { ipcRenderer } from 'electron'

const SideMenu = {
  namespaced: true,
  state: {
    instance: {
      baseURL: '',
      id: ''
    }
  },
  mutations: {
    updateInstance (state, instance) {
      state.instance = instance
    }
  },
  actions: {
    fetchInstance ({ commit }, id) {
      ipcRenderer.send('get-instance', id)
      ipcRenderer.on('error-get-instance', (event, err) => {
        // TODO: handle error
        console.log(err)
      })
      ipcRenderer.on('response-get-instance', (event, instance) => {
        commit('updateInstance', instance)
      })
    }
  }
}

export default SideMenu
