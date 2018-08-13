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
    async confirmInstance ({ commit }, domain) {
      commit('changeSearching', true)
      const res = await axios.get(`https://${domain}/api/v1/instance`)
        .finally(() => {
          commit('changeSearching', false)
        })
      commit('changeInstance', domain)
      return res.data
    }
  }
}

export default Login
