import { createStore, Store } from 'vuex'
import { ipcMain, ipcRenderer } from '~/spec/mock/electron'
import Language, { LanguageState } from '@/store/Preferences/Language'
import DefaultLanguage from '~/src/constants/language'
import { MyWindow } from '~/src/types/global'
import { RootState } from '@/store'
;(window as any as MyWindow).ipcRenderer = ipcRenderer

const state = (): LanguageState => {
  return {
    language: {
      language: DefaultLanguage.en.key,
      spellchecker: {
        enabled: true,
        languages: []
      }
    }
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state,
    actions: Language.actions,
    mutations: Language.mutations
  }
}

const preferencesStore = () => ({
  namespaced: true,
  modules: {
    Language: initStore()
  }
})

describe('Preferences/Language', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        Preferences: preferencesStore()
      }
    })
  })

  describe('loadLanguage', () => {
    beforeEach(() => {
      ipcMain.handle('get-preferences', () => {
        return {
          language: {
            language: DefaultLanguage.ja.key,
            spellchecker: {
              enabled: true,
              languages: []
            }
          }
        }
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('get-preferences')
    })
    it('should be updated', async () => {
      await store.dispatch('Preferences/Language/loadLanguage')
      expect(store.state.Preferences.Language.language.language).toEqual(DefaultLanguage.ja.key)
    })
  })

  describe('changeLanguage', () => {
    beforeEach(() => {
      ipcMain.handle('change-language', (_, key: string) => {
        return key
      })
    })
    afterEach(() => {
      ipcMain.removeHandler('change-language')
    })
    it('should be changed', async () => {
      await store.dispatch('Preferences/Language/changeLanguage', DefaultLanguage.ja.key)
      expect(store.state.Preferences.Language.language.language).toEqual(DefaultLanguage.ja.key)
    })
  })
})
