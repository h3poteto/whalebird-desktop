import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type AuthorizeState = {}

const state = (): AuthorizeState => ({})

const actions: ActionTree<AuthorizeState, RootState> = {
  submit: (_, code: string) => {
    return new Promise((resolve, reject) => {
      win.ipcRenderer.send('get-access-token', code.trim())
      win.ipcRenderer.once('response-get-access-token', (_, id: string) => {
        win.ipcRenderer.removeAllListeners('error-get-access-token')
        resolve(id)
      })
      win.ipcRenderer.once('error-get-access-token', (_, err: Error) => {
        win.ipcRenderer.removeAllListeners('response-get-access-token')
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
