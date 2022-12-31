import { Module, MutationTree, ActionTree } from 'vuex'
import { detector } from 'megalodon'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LocalServer } from '~src/types/localServer'
import { OAuth } from 'megalodon'
import { LocalAccount } from '~src/types/localAccount'
import { toRaw } from 'vue'

const win = (window as any) as MyWindow

export type LoginState = {
  domain: string | null
  searching: boolean
  server: LocalServer | null
  appData: OAuth.AppData | null
  sns: 'mastodon' | 'pleroma' | 'misskey'
}

const state = (): LoginState => ({
  domain: null,
  searching: false,
  server: null,
  appData: null,
  sns: 'mastodon'
})

export const MUTATION_TYPES = {
  CHANGE_DOMAIN: 'changeDomain',
  CHANGE_SEARCHING: 'changeSearching',
  CHANGE_SERVER: 'changeServer',
  CHANGE_APP_DATA: 'changeAppData',
  CHANGE_SNS: 'changeSNS'
}

const mutations: MutationTree<LoginState> = {
  [MUTATION_TYPES.CHANGE_DOMAIN]: (state: LoginState, instance: string | null) => {
    state.domain = instance
  },
  [MUTATION_TYPES.CHANGE_SEARCHING]: (state: LoginState, searching: boolean) => {
    state.searching = searching
  },
  [MUTATION_TYPES.CHANGE_SERVER]: (state: LoginState, server: LocalServer | null) => {
    state.server = server
  },
  [MUTATION_TYPES.CHANGE_APP_DATA]: (state: LoginState, appData: OAuth.AppData | null) => {
    state.appData = appData
  },
  [MUTATION_TYPES.CHANGE_SNS]: (state: LoginState, sns: 'mastodon' | 'pleroma' | 'misskey') => {
    state.sns = sns
  }
}

export const ACTION_TYPES = {
  ADD_SERVER: 'addServer',
  ADD_APP: 'addApp',
  AUTHORIZE: 'authorize',
  PAGE_BACK: 'pageBack',
  CONFIRM_INSTANCE: 'confirmInstance'
}

const actions: ActionTree<LoginState, RootState> = {
  [ACTION_TYPES.ADD_SERVER]: async ({ state, commit }): Promise<LocalServer> => {
    const server = await win.ipcRenderer.invoke('add-server', state.domain)
    commit(MUTATION_TYPES.CHANGE_SERVER, server)
    return server
  },
  [ACTION_TYPES.ADD_APP]: async ({ state, commit }) => {
    const appData = await win.ipcRenderer.invoke('add-app', `https://${state.domain}`)
    commit(MUTATION_TYPES.CHANGE_APP_DATA, appData)
  },
  [ACTION_TYPES.AUTHORIZE]: async ({ state }, code: string): Promise<number> => {
    const localAccount: LocalAccount = await win.ipcRenderer.invoke('authorize', {
      server: toRaw(state.server),
      appData: toRaw(state.appData),
      code
    })
    return localAccount.id
  },
  [ACTION_TYPES.PAGE_BACK]: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_DOMAIN, null)
    commit(MUTATION_TYPES.CHANGE_SERVER, null)
    commit(MUTATION_TYPES.CHANGE_APP_DATA, null)
  },
  [ACTION_TYPES.CONFIRM_INSTANCE]: async ({ commit }, domain: string): Promise<boolean> => {
    commit(MUTATION_TYPES.CHANGE_SEARCHING, true)
    const cleanDomain = domain.trim()
    try {
      const sns = await detector(`https://${cleanDomain}`)
      commit(MUTATION_TYPES.CHANGE_DOMAIN, cleanDomain)
      commit(MUTATION_TYPES.CHANGE_SNS, sns)
    } finally {
      commit(MUTATION_TYPES.CHANGE_SEARCHING, false)
    }
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
