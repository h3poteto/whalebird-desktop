import { ipcRenderer } from 'electron'

const Authorize = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    submit ({ commit }, code) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-access-token', code)
        ipcRenderer.once('response-get-access-token', (event, id) => {
          resolve(id)
        })
        ipcRenderer.once('error-get-access-token', (event, err) => {
          reject(err)
        })
      })
    }
  }
}

export default Authorize
