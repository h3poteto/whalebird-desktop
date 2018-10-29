import { ipcRenderer } from 'electron'
import router from '../router'
import { LightTheme, DarkTheme, SolarizedLightTheme, SolarizedDarkTheme, KimbieDarkTheme } from '../utils/theme'
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'
import Language from '~/src/constants/language'
import DefaultFonts from '../utils/fonts'

const App = {
  namespaced: true,
  state: {
    theme: LightTheme,
    fontSize: 14,
    displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
    notify: {
      reply: true,
      reblog: true,
      favourite: true,
      follow: true
    },
    timeFormat: TimeFormat.Absolute.value,
    language: Language.en.key,
    defaultFonts: DefaultFonts
  },
  mutations: {
    updateTheme (state, themeColorList) {
      state.theme = themeColorList
    },
    updateFontSize (state, value) {
      state.fontSize = value
    },
    updateDisplayNameStyle (state, value) {
      state.displayNameStyle = value
    },
    updateNotify (state, notify) {
      state.notify = notify
    },
    updateTimeFormat (state, format) {
      state.timeFormat = format
    },
    updateLanguage (state, key) {
      state.language = key
    },
    addFont (state, font) {
      const list = [font].concat(DefaultFonts)
      state.defaultFonts = Array.from(new Set(list))
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
    loadPreferences ({ commit, dispatch }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-preferences')
        ipcRenderer.once('error-get-preferences', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-preferences')
          reject(err)
        })
        ipcRenderer.once('response-get-preferences', (event, conf) => {
          ipcRenderer.removeAllListeners('error-get-preferences')
          dispatch('updateTheme', conf.appearance)
          commit('updateDisplayNameStyle', conf.appearance.displayNameStyle)
          commit('updateFontSize', conf.appearance.fontSize)
          commit('updateNotify', conf.notification.notify)
          commit('updateTimeFormat', conf.appearance.timeFormat)
          commit('updateLanguage', conf.language.language)
          commit('addFont', conf.appearance.font)
          resolve(conf)
        })
      })
    },
    updateTheme ({ commit }, appearance) {
      const themeKey = appearance.theme
      switch (themeKey) {
        case Theme.Light.key:
          commit('updateTheme', LightTheme)
          break
        case Theme.Dark.key:
          commit('updateTheme', DarkTheme)
          break
        case Theme.SolarizedLight.key:
          commit('updateTheme', SolarizedLightTheme)
          break
        case Theme.SolarizedDark.key:
          commit('updateTheme', SolarizedDarkTheme)
          break
        case Theme.KimbieDark.key:
          commit('updateTheme', KimbieDarkTheme)
          break
        case Theme.Custom.key:
          commit('updateTheme', appearance.customThemeColor)
          break
        default:
          commit('updateTheme', LightTheme)
          break
      }
    }
  }
}

export default App
