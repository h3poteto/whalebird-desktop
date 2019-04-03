import { ipcRenderer } from 'electron'

const Authorize = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    submit (_, code) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-access-token', code)
        ipcRenderer.once('response-get-access-token', (event, id) => {
          ipcRenderer.removeAllListeners('error-get-access-token')
          resolve(id)
        })
        ipcRenderer.once('error-get-access-token', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-access-token')
          reject(err)
        })
      })
    }
  }
}

export default Authorize
