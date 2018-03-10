import { ipcRenderer } from 'electron'
import axios from 'axios'

const Login = {
  namespaced: true,
  state: {
    instances: [],
    selectedInstance: null,
    page: 1
  },
  mutations: {
    updateInstances (state, instances) {
      state.instances = instances
    },
    changeInstance (state, instance) {
      state.selectedInstance = instance
    },
    changePage (state, page) {
      state.page = page
    }
  },
  actions: {
    searchInstance ({ commit }, domain) {
      console.log(domain)
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-social-token', 'get')
        ipcRenderer.once('error-get-social-token', (event, err) => {
          reject(err)
        })
        ipcRenderer.once('response-get-social-token', (event, token) => {
          axios
            .get(`https://instances.social/api/1.0/instances/search?q=${domain}`, {
              'headers': { 'Authorization': `Bearer ${token}` }
            })
            .then((res) => {
              commit('updateInstances', res.data.instances)
              resolve(res)
            })
        })
      })
    },
    fetchLogin ({ commit }, instance) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-auth-url', instance)
        ipcRenderer.once('error-get-auth-url', (event, err) => {
          reject(err)
        })
        ipcRenderer.once('response-get-auth-url', (event, url) => {
          resolve(url)
        })
      })
    },
    changeInstance ({ commit }, instance) {
      commit('changeInstance', instance)
    },
    pageBack ({ commit }) {
      commit('changePage', 1)
      commit('updateInstances', [])
      commit('changeInstance', null)
    }
  }
}

export default Login
