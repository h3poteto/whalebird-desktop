import { ipcRenderer } from 'electron'
import axios from 'axios'

const Login = {
  namespaced: true,
  state: {
    instances: [],
    domainName: '',
    selectedInstance: null,
    page: 2
  },
  mutations: {
    updateInstances (state, instances) {
      state.instances = instances
    },
    changeInstance (state, instance) {
      state.selectedInstance = instance
    },
    changePage (state, page) {
      // Invalidate page changer until implement instance search form
      // state.page = page
    },
    updateDomainName (state, domain) {
      state.domainName = domain
    }
  },
  actions: {
    searchInstance ({ commit }, domain) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-social-token', 'get')
        ipcRenderer.once('error-get-social-token', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-social-token')
          reject(err)
        })
        ipcRenderer.once('response-get-social-token', (event, token) => {
          ipcRenderer.removeAllListeners('error-get-social-token')
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
          ipcRenderer.removeAllListeners('response-get-auth-url')
          reject(err)
        })
        ipcRenderer.once('response-get-auth-url', (event, url) => {
          ipcRenderer.removeAllListeners('response-get-auth-url')
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
      commit('updateDomainName', '')
    },
    confirmInstance ({ commit }, domain) {
      return new Promise((resolve, reject) => {
        axios
          .get(`https://${domain}/api/v1/instance`)
          .then((res) => {
            commit('changeInstance', domain)
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    updateDomainName ({ commit }, domain) {
      commit('updateDomainName', domain)
      commit('changeInstance', null)
    }
  }
}

export default Login
