import Mastodon, { Instance } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type LoginState = {
  selectedInstance: string | null
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
      win.ipcRenderer.send('get-auth-url', instance)
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
    try {
      await Mastodon.get<Instance>('/api/v1/instance', {}, `https://${cleanDomain}`, rootState.App.proxyConfiguration)
      commit(MUTATION_TYPES.CHANGE_SEARCHING, false)
    } catch (err) {
      // https://gist.github.com/okapies/60d62d0df0163bbfb4ab09c1766558e8
      // Check /.well-known/host-meta to confirm mastodon instance.
      const res = await Mastodon.get<any>('/.well-known/host-meta', {}, `https://${cleanDomain}`, rootState.App.proxyConfiguration).finally(
        () => {
          commit(MUTATION_TYPES.CHANGE_SEARCHING, false)
        }
      )
      const parser = new DOMParser()
      const dom = parser.parseFromString(res.data, 'text/xml')
      const link = dom.getElementsByTagName('Link')[0].outerHTML
      if (!link.includes(`https://${cleanDomain}/.well-known/webfinger`)) {
        throw new Error('domain is not activity pub')
      }
    }
    commit(MUTATION_TYPES.CHANGE_INSTANCE, cleanDomain)
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
