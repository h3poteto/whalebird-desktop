import { ipcRenderer } from 'electron'
import router from '../router'
import { LightTheme, DarkTheme } from '../utils/theme'
import Visibility from '../../constants/visibility'
import DisplayStyle from '../../constants/displayStyle'

const App = {
  namespaced: true,
  state: {
    theme: LightTheme,
    fontSize: 14,
    displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
    tootVisibility: Visibility.Public.value
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
    },
    updateFontSize (state, value) {
      state.fontSize = value
    },
    updateDisplayNameStyle (state, value) {
      state.displayNameStyle = value
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
        commit('updateDisplayNameStyle', conf.general.displayNameStyle)
        commit('updateFontSize', conf.general.fontSize)
      })
    }
  }
}

export default App
