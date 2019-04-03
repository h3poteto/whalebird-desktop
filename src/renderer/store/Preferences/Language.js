import { ipcRenderer } from 'electron'
import Language from '~/src/constants/language'

export default {
  namespaced: true,
  state: {
    language: {
      language: Language.en.key
    }
  },
  mutations: {
    updateLanguage (state, conf) {
      state.language = conf
    },
    changeLanguage (state, key) {
      state.language.language = key
    }
  },
  actions: {
    loadLanguage ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-preferences')
        ipcRenderer.once('error-get-preferences', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-preferences')
          reject(err)
        })
        ipcRenderer.once('response-get-preferences', (event, conf) => {
          ipcRenderer.removeAllListeners('error-get-preferences')
          commit('updateLanguage', conf.language)
          resolve(conf)
        })
      })
    },
    changeLanguage ({ commit }, key) {
      return new Promise(resolve => {
        ipcRenderer.send('change-language', key)
        ipcRenderer.once('response-change-language', (event, value) => {
          commit('changeLanguage', value)
          resolve(value)
        })
      })
    },
    relaunch () {
      ipcRenderer.send('relaunch')
    }
  }
}
