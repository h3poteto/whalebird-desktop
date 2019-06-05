import { ipcRenderer } from 'electron'
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'
import { LightTheme, ThemeColorType } from '~/src/constants/themeColor'
import DefaultFonts from '@/utils/fonts'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { Appearance } from '~/src/types/appearance'

export type AppearanceState = {
  appearance: Appearance
  fonts: Array<string>
}

const state = (): AppearanceState => ({
  appearance: {
    theme: Theme.Light.key,
    fontSize: 14,
    displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
    timeFormat: TimeFormat.Absolute.value,
    customThemeColor: LightTheme,
    font: DefaultFonts[0],
    tootPadding: 8
  },
  fonts: []
})

export const MUTATION_TYPES = {
  UPDATE_APPEARANCE: 'updateAppearance',
  UPDATE_FONTS: 'updateFonts'
}

const mutations: MutationTree<AppearanceState> = {
  [MUTATION_TYPES.UPDATE_APPEARANCE]: (state, conf: Appearance) => {
    state.appearance = conf
  },
  [MUTATION_TYPES.UPDATE_FONTS]: (state, fonts: Array<string>) => {
    state.fonts = fonts
  }
}

const actions: ActionTree<AppearanceState, RootState> = {
  loadAppearance: ({ commit }) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-preferences')
      ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-preferences')
        reject(err)
      })
      ipcRenderer.once('response-get-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-get-preferences')
        commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance as Appearance)
        resolve(conf)
      })
    })
  },
  loadFonts: ({ commit }) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('list-fonts')
      ipcRenderer.once('error-list-fonts', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-list-fonts')
        reject(err)
      })
      ipcRenderer.once('response-list-fonts', (_, fonts: Array<string>) => {
        ipcRenderer.removeAllListeners('error-list-fonts')
        commit(MUTATION_TYPES.UPDATE_FONTS, [DefaultFonts[0]].concat(fonts))
        resolve(fonts)
      })
    })
  },
  updateTheme: ({ dispatch, commit, state }, themeKey: string) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      theme: themeKey
    })
    const config = {
      appearance: newAppearance
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance as Appearance)
        dispatch('App/loadPreferences', null, { root: true })
        resolve(conf.appearance)
      })
    })
  },
  updateFontSize: ({ dispatch, commit, state }, fontSize: number) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      fontSize: fontSize
    })
    const config = {
      appearance: newAppearance
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance as Appearance)
        dispatch('App/loadPreferences', null, { root: true })
        resolve(conf.appearance)
      })
    })
  },
  updateDisplayNameStyle: ({ dispatch, commit, state }, value: number) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      displayNameStyle: value
    })
    const config = {
      appearance: newAppearance
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        dispatch('App/loadPreferences', null, { root: true })
        commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance as Appearance)
        resolve(conf.appearance)
      })
    })
  },
  updateTimeFormat: ({ dispatch, commit, state }, value: number) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      timeFormat: value
    })
    const config = {
      appearance: newAppearance
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        dispatch('App/loadPreferences', null, { root: true })
        commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance as Appearance)
        resolve(conf.appearance)
      })
    })
  },
  updateCustomThemeColor: ({ dispatch, state, commit }, value: object) => {
    const newCustom: ThemeColorType = Object.assign({}, state.appearance.customThemeColor, value)
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      customThemeColor: newCustom
    })
    const config = {
      appearance: newAppearance
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance as Appearance)
        dispatch('App/loadPreferences', null, { root: true })
        resolve(conf.appearance)
      })
    })
  },
  updateFont: ({ dispatch, state, commit }, value: string) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      font: value
    })
    const config = {
      appearance: newAppearance
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance as Appearance)
        dispatch('App/loadPreferences', null, { root: true })
        resolve(conf.appearance)
      })
    })
  },
  updateTootPadding: ({ dispatch, state, commit }, value: number) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      tootPadding: value
    })
    const config = {
      appearance: newAppearance
    }
    return new Promise((resolve, reject) => {
      ipcRenderer.send('update-preferences', config)
      ipcRenderer.once('error-update-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-update-preferences')
        reject(err)
      })
      ipcRenderer.once('response-update-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-update-preferences')
        commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance as Appearance)
        dispatch('App/loadPreferences', null, { root: true })
        resolve(conf.appearance)
      })
    })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<AppearanceState, RootState>
