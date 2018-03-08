import { ipcRenderer } from 'electron'

const Login = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    checkToken ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('load-access-token', 'load')
        ipcRenderer.on('error-access-token', (event, err) => {
          reject(err)
        })
        ipcRenderer.on('local-access-token', (event, _) => {
          resolve()
        })
      })
    },
    fetchLogin ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-auth-link', 'get')
        ipcRenderer.on('auth-link-reply', (event, arg) => {
          resolve(arg)
        })
      })
    }
  }
}

export default Login
