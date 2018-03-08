import { ipcRenderer } from 'electron'
import axios from 'axios'

const Login = {
  namespaced: true,
  state: {
    instances: [],
    selectedInstance: null
  },
  mutations: {
    updateInstances (state, body) {
      state.instances = body.instances
    },
    changeInstance (state, instance) {
      state.selectedInstance = instance
    }
  },
  actions: {
    searchInstance ({ commit }, domain) {
      ipcRenderer.send('get-instance-token', 'get')
      ipcRenderer.on('instance-token', (event, token) => {
        axios
          .get(`https://instances.social/api/1.0/instances/search?q=${domain}`, {
            'headers': { 'Authorization': `Bearer ${token}` }
          })
          .then((res) => {
            commit('updateInstances', res.data)
            console.log(res.data)
          })
      })
    },
    fetchLogin ({ commit }, instance) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-auth-link', instance)
        ipcRenderer.on('auth-link-reply', (event, arg) => {
          resolve(arg)
        })
      })
    },
    changeInstance ({ commit }, instance) {
      commit('changeInstance', instance)
    }
  }
}

export default Login
