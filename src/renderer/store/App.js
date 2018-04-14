import { ipcRenderer } from 'electron'
import router from '../router'
import { LightTheme, DarkTheme } from '../utils/theme'

const App = {
  namespaced: true,
  state: {
    theme: LightTheme
  },
  mutations: {
    updateTheme (state, themeName) {
      switch (themeName) {
        case 'light':
          state.theme = LightTheme
          break
        case 'dark':
          state.theme = DarkTheme
          break
        default:
          state.theme = LightTheme
          break
      }
    }
  },
  actions: {
    watchShortcutsEvents () {
      ipcRenderer.on('open-preferences', (event) => {
        router.push('/preferences/general')
      })
    },
    removeShortcutsEvents () {
      ipcRenderer.removeAllListeners('open-preferences')
    },
    loadPreferences ({ commit }) {
      ipcRenderer.send('get-preferences')
      ipcRenderer.once('error-get-preferences', (event, err) => {
        ipcRenderer.removeAllListeners('response-get-preferences')
      })
      ipcRenderer.once('response-get-preferences', (event, conf) => {
        ipcRenderer.removeAllListeners('error-get-preferences')
        commit('updateTheme', conf.general.theme)
      })
    }
  }
}

export default App
