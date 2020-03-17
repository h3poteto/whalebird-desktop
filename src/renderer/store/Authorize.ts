import { Module, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type AuthorizeState = {}

const state = (): AuthorizeState => ({})

const actions: ActionTree<AuthorizeState, RootState> = {
  submit: (_, request: { code: string | null; sns: 'mastodon' | 'pleroma' | 'misskey' }) => {
    return new Promise((resolve, reject) => {
      let req = {
        sns: request.sns
      }
      if (request.code) {
        req = Object.assign(req, {
          code: request.code.trim()
        })
      }
      win.ipcRenderer.send('get-access-token', req)
      win.ipcRenderer.once('response-get-access-token', (_, id: string) => {
        win.ipcRenderer.removeAllListeners('error-get-access-token')
        resolve(id)
      })
      win.ipcRenderer.once('error-get-access-token', (_, err: Error) => {
        console.error(err)
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
