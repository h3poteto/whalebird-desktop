import { ipcRenderer } from 'electron'
import { Module, ActionTree } from 'vuex'

export interface AuthorizeState {}

const state = (): AuthorizeState => ({})

// TODO: use type of rootState
const actions: ActionTree<AuthorizeState, any> = {
  submit: (_, code: string) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-access-token', code)
      ipcRenderer.once('response-get-access-token', (_, id: string) => {
        ipcRenderer.removeAllListeners('error-get-access-token')
        resolve(id)
      })
      ipcRenderer.once('error-get-access-token', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-access-token')
        reject(err)
      })
    })
  }
}

// TODO: use type of rootState
const Authorize: Module<AuthorizeState, any> = {
  namespaced: true,
  state: state,
  mutations: {},
  actions: actions
}

export default Authorize
