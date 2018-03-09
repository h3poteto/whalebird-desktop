import { ipcRenderer } from 'electron'

const Authorize = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    submit ({ commit }, code) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-access-token', code)
        ipcRenderer.on('response-get-access-token', (event, id) => {
          console.log(id)
          resolve(id)
        })
        ipcRenderer.on('error-get-access-token', (event, err) => {
          console.log(err)
        })
      })
    }
  }
}

export default Authorize
