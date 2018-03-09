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
      ipcRenderer.send('get-social-token', 'get')
      ipcRenderer.on('response-get-social-token', (event, token) => {
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
        ipcRenderer.send('get-auth-url', instance)
        ipcRenderer.on('error-get-auth-url', (event, err) => {
          reject(err)
        })
        ipcRenderer.on('response-get-auth-url', (event, url) => {
          resolve(url)
        })
      })
    },
    changeInstance ({ commit }, instance) {
      commit('changeInstance', instance)
    }
  }
}

export default Login
