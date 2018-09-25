import { ipcRenderer } from 'electron'
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'
import { LightTheme } from '~/src/renderer/utils/theme'
import DefaultFonts from '../../utils/fonts'

export default {
  namespaced: true,
  state: {
    appearance: {
      theme: Theme.Light.key,
      fontSize: 14,
      displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
      timeFormat: TimeFormat.Absolute.value,
      customThemeColor: LightTheme
    },
    fonts: []
  },
  getters: {
    currentFont: state => {
      const font = DefaultFonts.find(f => state.fonts.includes(f))
      if (font) {
        return font
      }
      return DefaultFonts[0]
    }
  },
  mutations: {
    updateAppearance (state, conf) {
      state.appearance = conf
    },
    updateFonts (state, fonts) {
      state.fonts = fonts
    }
  },
  actions: {
    loadAppearance ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-preferences')
        ipcRenderer.once('error-get-preferences', (event, err) => {
          ipcRenderer.removeAllListeners('response-get-preferences')
          reject(err)
        })
        ipcRenderer.once('response-get-preferences', (event, conf) => {
          ipcRenderer.removeAllListeners('error-get-preferences')
          commit('updateAppearance', conf.appearance)
          resolve(conf)
        })
      })
    },
    loadFonts ({ commit }) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('list-fonts')
        ipcRenderer.once('error-list-fonts', (event, err) => {
          ipcRenderer.removeAllListeners('response-list-fonts')
          reject(err)
        })
        ipcRenderer.once('response-list-fonts', (event, fonts) => {
          ipcRenderer.removeAllListeners('error-list-fonts')
          commit('updateFonts', fonts)
          resolve(fonts)
        })
      })
    },
    updateTheme ({ dispatch, commit, state }, theme) {
      const newAppearance = Object.assign({}, state.appearance, {
        theme: theme
      })
      const config = {
        appearance: newAppearance
      }
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (event, err) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
      })
      ipcRenderer.once('response-update-preferences', (event, conf) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit('updateAppearance', conf.appearance)
        dispatch('App/loadPreferences', null, { root: true })
      })
    },
    updateFontSize ({ dispatch, commit, state }, fontSize) {
      const newAppearance = Object.assign({}, state.appearance, {
        fontSize: fontSize
      })
      const config = {
        appearance: newAppearance
      }
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (event, err) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
      })
      ipcRenderer.once('response-update-preferences', (event, conf) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit('updateAppearance', conf.appearance)
        dispatch('App/loadPreferences', null, { root: true })
      })
    },
    updateDisplayNameStyle ({ dispatch, commit, state }, value) {
      const newAppearance = Object.assign({}, state.appearance, {
        displayNameStyle: value
      })
      const config = {
        appearance: newAppearance
      }
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (event, err) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
      })
      ipcRenderer.once('response-update-preferences', (event, conf) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        dispatch('App/loadPreferences', null, { root: true })
        commit('updateAppearance', conf.appearance)
      })
    },
    updateTimeFormat ({ dispatch, commit, state }, value) {
      const newAppearance = Object.assign({}, state.appearance, {
        timeFormat: value
      })
      const config = {
        appearance: newAppearance
      }
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (event, err) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
      })
      ipcRenderer.once('response-update-preferences', (event, conf) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        dispatch('App/loadPreferences', null, { root: true })
        commit('updateAppearance', conf.appearance)
      })
    },
    updateCustomThemeColor ({ dispatch, state, commit }, value) {
      const newCustom = Object.assign({}, state.appearance.customThemeColor, value)
      const newAppearance = Object.assign({}, state.appearance, {
        customThemeColor: newCustom
      })
      const config = {
        appearance: newAppearance
      }
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (event, err) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
      })
      ipcRenderer.once('response-update-preferences', (event, conf) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit('updateAppearance', conf.appearance)
        dispatch('App/loadPreferences', null, { root: true })
      })
    }
  }
}
