import { ipcRenderer } from 'electron'
import axios from 'axios'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface LoginState {
  selectedInstance: string | null,
  searching: boolean
}

const state = (): LoginState => ({
  selectedInstance: null,
  searching: false
})

export const MUTATION_TYPES = {
  CHANGE_INSTANCE: 'changeInstance',
  CHANGE_SEARCHING: 'changeSearching'
}

const mutations: MutationTree<LoginState> = {
  [MUTATION_TYPES.CHANGE_INSTANCE]: (state: LoginState, instance: string) => {
    state.selectedInstance = instance
  },
  [MUTATION_TYPES.CHANGE_SEARCHING]: (state: LoginState, searching: boolean) => {
    state.searching = searching
  }
}

const actions: ActionTree<LoginState, RootState> = {
  fetchLogin: (_, instance: string) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-auth-url', instance)
      ipcRenderer.once('error-get-auth-url', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-auth-url')
        reject(err)
      })
      ipcRenderer.once('response-get-auth-url', (_, url: string) => {
        ipcRenderer.removeAllListeners('response-get-auth-url')
        resolve(url)
      })
    })
  },
  pageBack: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_INSTANCE, null)
  },
  confirmInstance: async ({ commit }, domain: string): Promise<boolean> => {
    commit(MUTATION_TYPES.CHANGE_SEARCHING, true)
    await axios.get(`https://${domain}/api/v1/instance`)
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_SEARCHING, false)
      })
    commit(MUTATION_TYPES.CHANGE_INSTANCE, domain)
    return true
  }
}

const Login: Module<LoginState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Login
