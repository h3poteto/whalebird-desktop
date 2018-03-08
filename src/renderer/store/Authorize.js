import { ipcRenderer } from 'electron'

const Authorize = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    submit ({ commit }, code) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-access-token', code)
        ipcRenderer.on('access-token-reply', (event, arg) => {
          console.log(arg)
          resolve(arg)
        })
        ipcRenderer.on('error-access-token', (event, err) => {
          console.log(err)
        })
      })
    }
  }
}

export default Authorize
