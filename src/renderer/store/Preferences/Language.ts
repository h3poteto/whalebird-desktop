import Language from '~/src/constants/language'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { Language as LanguageSet } from '~/src/types/language'
import { BaseConfig } from '~/src/types/preference'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

export type LanguageState = {
  language: LanguageSet
}

const state: LanguageState = {
  language: {
    language: Language.en.key,
    spellchecker: {
      enabled: true,
      languages: [Language.en.key]
    }
  }
}

export const MUTATION_TYPES = {
  UPDATE_LANGUAGE: 'updateLanguage',
  CHANGE_LANGUAGE: 'changeLanguage',
  TOGGLE_SPELLCHECKER: 'toggleSpellchecker',
  UPDATE_SPELLCHECKER_LANGUAGES: 'updateSpellcheckerLanguages'
}

const mutations: MutationTree<LanguageState> = {
  [MUTATION_TYPES.UPDATE_LANGUAGE]: (state, conf: LanguageSet) => {
    state.language = conf
  },
  [MUTATION_TYPES.CHANGE_LANGUAGE]: (state, key: string) => {
    state.language.language = key
  },
  [MUTATION_TYPES.TOGGLE_SPELLCHECKER]: (state, enabled: boolean) => {
    state.language.spellchecker.enabled = enabled
  },
  [MUTATION_TYPES.UPDATE_SPELLCHECKER_LANGUAGES]: (state, languages: Array<string>) => {
    state.language.spellchecker.languages = languages
  }
}

const actions: ActionTree<LanguageState, RootState> = {
  loadLanguage: async ({ commit }) => {
    const conf: BaseConfig = await win.ipcRenderer.invoke('get-preferences')
    commit(MUTATION_TYPES.UPDATE_LANGUAGE, conf.language as LanguageSet)
    return conf
  },
  changeLanguage: async ({ commit }, key: string) => {
    const value: string = await win.ipcRenderer.invoke('change-language', key)
    commit(MUTATION_TYPES.CHANGE_LANGUAGE, value)
    return value
  },
  toggleSpellchecker: async ({ commit }, enabled: boolean) => {
    const value: boolean = await win.ipcRenderer.invoke('toggle-spellchecker', enabled)
    commit(MUTATION_TYPES.TOGGLE_SPELLCHECKER, value)
    return value
  },
  updateSpellcheckerLanguages: async ({ commit }, languages: Array<string>) => {
    const langs: Array<string> = await win.ipcRenderer.invoke('update-spellchecker-languages', languages)
    commit(MUTATION_TYPES.UPDATE_SPELLCHECKER_LANGUAGES, langs)
    return langs
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
