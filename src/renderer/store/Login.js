import { ipcRenderer } from 'electron'

const Login = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
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
