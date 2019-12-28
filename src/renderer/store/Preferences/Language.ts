import Language from '~/src/constants/language'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { Language as LanguageSet } from '~/src/types/language'
import { BaseConfig } from '~/src/types/preference'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

export type LanguageState = {
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

const actions: ActionTree<LanguageState, RootState> = {
  loadLanguage: ({ commit }) => {
    return new Promise((resolve, reject) => {
      win.ipcRenderer.send('get-preferences')
      win.ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        win.ipcRenderer.removeAllListeners('response-get-preferences')
        reject(err)
      })
      win.ipcRenderer.once('response-get-preferences', (_, conf: BaseConfig) => {
        win.ipcRenderer.removeAllListeners('error-get-preferences')
        commit(MUTATION_TYPES.UPDATE_LANGUAGE, conf.language as LanguageSet)
        resolve(conf)
      })
    })
  },
  changeLanguage: ({ commit }, key: string) => {
    return new Promise(resolve => {
      win.ipcRenderer.send('change-language', key)
      win.ipcRenderer.once('response-change-language', (_, value: string) => {
        commit(MUTATION_TYPES.CHANGE_LANGUAGE, value)
        resolve(value)
      })
    })
  },
  relaunch: () => {
    win.ipcRenderer.send('relaunch')
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<LanguageState, RootState>
