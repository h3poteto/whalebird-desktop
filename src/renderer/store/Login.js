import { ipcRenderer } from 'electron'
import axios from 'axios'

const Login = {
  namespaced: true,
  state: {
    instances: [],
    selectedInstance: null,
    searching: false
  },
  mutations: {
    changeInstance (state, instance) {
      state.selectedInstance = instance
    },
    changeSearching (state, value) {
      state.searching = value
    }
  },
  actions: {
    fetchLogin ({ commit }, instance) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-auth-url', instance)
        ipcRenderer.once('error-get-auth-url', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-auth-url')
          reject(err)
        })
        ipcRenderer.once('response-get-auth-url', (event, url) => {
          ipcRenderer.removeAllListeners('response-get-auth-url')
          resolve(url)
        })
      })
    },
    pageBack ({ commit }) {
      commit('changeInstance', null)
    },
    confirmInstance ({ commit }, domain) {
      return new Promise((resolve, reject) => {
        commit('changeSearching', true)
        axios
          .get(`https://${domain}/api/v1/instance`)
          .then((res) => {
            commit('changeInstance', domain)
            resolve(res)
          })
          .finally(() => {
            commit('changeSearching', false)
          })
      })
    }
  }
}

export default Login
