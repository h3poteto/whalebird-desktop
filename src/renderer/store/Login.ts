import { detector } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type LoginState = {
  selectedInstance: string | null
  searching: boolean
  sns: 'mastodon' | 'pleroma' | 'misskey'
}

const state = (): LoginState => ({
  selectedInstance: null,
  searching: false,
  sns: 'mastodon'
})

export const MUTATION_TYPES = {
  CHANGE_INSTANCE: 'changeInstance',
  CHANGE_SEARCHING: 'changeSearching',
  CHANGE_SNS: 'changeSNS'
}

const mutations: MutationTree<LoginState> = {
  [MUTATION_TYPES.CHANGE_INSTANCE]: (state: LoginState, instance: string) => {
    state.selectedInstance = instance
  },
  [MUTATION_TYPES.CHANGE_SEARCHING]: (state: LoginState, searching: boolean) => {
    state.searching = searching
  },
  [MUTATION_TYPES.CHANGE_SNS]: (state: LoginState, sns: 'mastodon' | 'pleroma' | 'misskey') => {
    state.sns = sns
  }
}

const actions: ActionTree<LoginState, RootState> = {
  fetchLogin: ({ state }) => {
    return new Promise((resolve, reject) => {
      win.ipcRenderer.send('get-auth-url', {
        instance: state.selectedInstance,
        sns: state.sns
      })
      win.ipcRenderer.once('error-get-auth-url', (_, err: Error) => {
        win.ipcRenderer.removeAllListeners('response-get-auth-url')
        reject(err)
      })
      win.ipcRenderer.once('response-get-auth-url', (_, url: string) => {
        win.ipcRenderer.removeAllListeners('response-get-auth-url')
        resolve(url)
      })
    })
  },
  pageBack: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_INSTANCE, null)
  },
  confirmInstance: async ({ commit, rootState }, domain: string): Promise<boolean> => {
    commit(MUTATION_TYPES.CHANGE_SEARCHING, true)
    const cleanDomain = domain.trim()
    const sns = await detector(`https://${cleanDomain}`, rootState.App.proxyConfiguration)
    commit(MUTATION_TYPES.CHANGE_SEARCHING, false)
    commit(MUTATION_TYPES.CHANGE_INSTANCE, cleanDomain)
    commit(MUTATION_TYPES.CHANGE_SNS, sns)
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
