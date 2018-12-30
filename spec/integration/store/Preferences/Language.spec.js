import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import Language from '@/store/Preferences/Language'
import DefaultLanguage from '~/src/constants/language'

const state = {
  language: {
    language: DefaultLanguage.en.key
  }
}

const initState = {
  namespaced: true,
  state: state,
  actions: Language.actions,
  mutations: Language.mutations
}

describe('Preferences/Language', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Language: initState
      }
    })
  })

  describe('loadLanguage', () => {
    beforeEach(() => {
      ipcMain.once('get-preferences', (event, _) => {
        event.sender.send('response-get-preferences', {
          language: {
            language: DefaultLanguage.ja.key
          }
        })
      })
    })
    it('should be updated', async () => {
      await store.dispatch('Language/loadLanguage')
      expect(store.state.Language.language.language).toEqual(DefaultLanguage.ja.key)
    })
  })

  describe('changeLanguage', () => {
    beforeEach(() => {
      ipcMain.once('change-language', (event, key) => {
        event.sender.send('response-change-language', key)
      })
    })
    it('should be changed', async () => {
      await store.dispatch('Language/changeLanguage', DefaultLanguage.ja.key)
      expect(store.state.Language.language.language).toEqual(DefaultLanguage.ja.key)
    })
  })
})
