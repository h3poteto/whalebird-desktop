import { ipcRenderer } from 'electron'
import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type AuthorizeState = {}

const state = (): AuthorizeState => ({})

const actions: ActionTree<AuthorizeState, RootState> = {
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

const Authorize: Module<AuthorizeState, RootState> = {
  namespaced: true,
  state: state,
  mutations: {},
  actions: actions
}

export default Authorize
