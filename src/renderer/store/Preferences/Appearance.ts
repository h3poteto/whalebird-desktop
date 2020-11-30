import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'
import { LightTheme, ThemeColorType } from '~/src/constants/themeColor'
import DefaultFonts from '@/utils/fonts'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { Appearance } from '~/src/types/appearance'
import { BaseConfig } from '~/src/types/preference'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

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
    state.fonts = Array.from(new Set(fonts))
  }
}

const actions: ActionTree<AppearanceState, RootState> = {
  loadAppearance: async ({ commit }) => {
    const conf: BaseConfig = await win.ipcRenderer.invoke('get-preferences')
    commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance)
    return conf
  },
  loadFonts: async ({ commit }) => {
    const fonts: Array<string> = await win.ipcRenderer.invoke('list-fonts')
    commit(MUTATION_TYPES.UPDATE_FONTS, [DefaultFonts[0]].concat(fonts))
    return fonts
  },
  updateTheme: async ({ dispatch, commit, state }, themeKey: string) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      theme: themeKey
    })
    const config = {
      appearance: newAppearance
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config)
    commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance)
    dispatch('App/loadPreferences', null, { root: true })
  },
  updateFontSize: async ({ dispatch, commit, state }, fontSize: number) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      fontSize: fontSize
    })
    const config = {
      appearance: newAppearance
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config)
    commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance)
    dispatch('App/loadPreferences', null, { root: true })
  },
  updateDisplayNameStyle: async ({ dispatch, commit, state }, value: number) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      displayNameStyle: value
    })
    const config = {
      appearance: newAppearance
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config)
    dispatch('App/loadPreferences', null, { root: true })
    commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance)
  },
  updateTimeFormat: async ({ dispatch, commit, state }, value: number) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      timeFormat: value
    })
    const config = {
      appearance: newAppearance
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config)
    dispatch('App/loadPreferences', null, { root: true })
    commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance)
  },
  updateCustomThemeColor: async ({ dispatch, state, commit }, value: object) => {
    const newCustom: ThemeColorType = Object.assign({}, state.appearance.customThemeColor, value)
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      customThemeColor: newCustom
    })
    const config = {
      appearance: newAppearance
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config)
    commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance)
    dispatch('App/loadPreferences', null, { root: true })
  },
  updateFont: async ({ dispatch, state, commit }, value: string) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      font: value
    })
    const config = {
      appearance: newAppearance
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config)
    commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance)
    dispatch('App/loadPreferences', null, { root: true })
  },
  updateTootPadding: async ({ dispatch, state, commit }, value: number) => {
    const newAppearance: Appearance = Object.assign({}, state.appearance, {
      tootPadding: value
    })
    const config = {
      appearance: newAppearance
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config)
    commit(MUTATION_TYPES.UPDATE_APPEARANCE, conf.appearance)
    dispatch('App/loadPreferences', null, { root: true })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<AppearanceState, RootState>
