import { ipcRenderer } from 'electron'
import Language from '~/src/constants/language'
import { Module, MutationTree, ActionTree } from 'vuex'

interface LanguageSet {
  language: string
}

export interface LanguageState {
  language: LanguageSet
}

const state: LanguageState = {
  language: {
    language: Language.en.key
  }
}

export const MUTATION_TYPES = {
  UPDATE_LANGUAGE: 'updateLanguage',
  CHANGE_LANGUAGE: 'changeLanguage'
}

const mutations: MutationTree<LanguageState> = {
  [MUTATION_TYPES.UPDATE_LANGUAGE]: (state, conf: LanguageSet) => {
    state.language = conf
  },
  [MUTATION_TYPES.CHANGE_LANGUAGE]: (state, key: string) => {
    state.language.language = key
  }
}

// TODO: use type of rootState
const actions: ActionTree<LanguageState, any> = {
  loadLanguage: ({ commit }) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-preferences')
      ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-preferences')
        reject(err)
      })
      ipcRenderer.once('response-get-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-get-preferences')
        commit(MUTATION_TYPES.UPDATE_LANGUAGE, conf.language as LanguageSet)
        resolve(conf)
      })
    })
  },
  changeLanguage: ({ commit }, key: string) => {
    return new Promise(resolve => {
      ipcRenderer.send('change-language', key)
      ipcRenderer.once('response-change-language', (_, value: string) => {
        commit(MUTATION_TYPES.CHANGE_LANGUAGE, value)
        resolve(value)
      })
    })
  },
  relaunch: () => {
    ipcRenderer.send('relaunch')
  }
}

// TODO: use type of rootState
export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<LanguageState, any>
