import { ipcRenderer } from 'electron'
import { MutationTree, ActionTree, Module } from 'vuex'
import router from '@/router'
import { LightTheme, DarkTheme, SolarizedLightTheme, SolarizedDarkTheme, KimbieDarkTheme, ThemeType } from '@/utils/theme'
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'
import Language from '~/src/constants/language'
import DefaultFonts from '@/utils/fonts'
import { RootState } from '@/store'

export interface Notify {
  reply: boolean,
  reblog: boolean,
  favourite: boolean,
  follow: boolean
}

export interface AppState {
  theme: ThemeType,
  fontSize: number,
  displayNameStyle: number,
  notify: Notify,
  timeFormat: number,
  language: string,
  defaultFonts: Array<string>,
  ignoreCW: boolean,
  ignoreNFSW: boolean,
  hideAllAttachments: boolean
}

const state = (): AppState => ({
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
  defaultFonts: DefaultFonts,
  ignoreCW: false,
  ignoreNFSW: false,
  hideAllAttachments: false
})

const MUTATION_TYPES = {
  UPDATE_THEME: 'updateTheme',
  UPDATE_FONT_SIZE: 'updateFontSize',
  UPDATE_DISPLAY_NAME_STYLE: 'updateDisplayNameStyle',
  UPDATE_NOTIFY: 'updateNotify',
  UPDATE_TIME_FORMAT: 'updateTimeFormat',
  UPDATE_LANGUAGE: 'updateLanguage',
  ADD_FONT: 'addFont',
  UPDATE_IGNORE_CW: 'updateIgnoreCW',
  UPDATE_IGNORE_NFSW: 'updateIgnoreNFSW',
  UPDATE_HIDE_ALL_ATTACHMENTS: 'updateHideAllAttachments'
}

const mutations: MutationTree<AppState> = {
  [MUTATION_TYPES.UPDATE_THEME]: (state: AppState, themeColorList: any) => {
    state.theme = themeColorList
  },
  [MUTATION_TYPES.UPDATE_FONT_SIZE]: (state: AppState, value: number) => {
    state.fontSize = value
  },
  [MUTATION_TYPES.UPDATE_DISPLAY_NAME_STYLE]: (state: AppState, value: number) => {
    state.displayNameStyle = value
  },
  [MUTATION_TYPES.UPDATE_NOTIFY]: (state: AppState, notify: Notify) => {
    state.notify = notify
  },
  [MUTATION_TYPES.UPDATE_TIME_FORMAT]: (state: AppState, format: number) => {
    state.timeFormat = format
  },
  [MUTATION_TYPES.UPDATE_LANGUAGE]: (state: AppState, key: string) => {
    state.language = key
  },
  [MUTATION_TYPES.ADD_FONT]: (state: AppState, font: string) => {
    const list = [font].concat(DefaultFonts)
    state.defaultFonts = Array.from(new Set(list))
  },
  [MUTATION_TYPES.UPDATE_IGNORE_CW]: (state: AppState, cw: boolean) => {
    state.ignoreCW = cw
  },
  [MUTATION_TYPES.UPDATE_IGNORE_NFSW]: (state: AppState, nfsw: boolean) => {
    state.ignoreNFSW = nfsw
  },
  [MUTATION_TYPES.UPDATE_HIDE_ALL_ATTACHMENTS]: (state: AppState, hideAllAttachments: boolean) => {
    state.hideAllAttachments = hideAllAttachments
  }
}

const actions: ActionTree<AppState, RootState> = {
  watchShortcutsEvents: () => {
    ipcRenderer.on('open-preferences', () => {
      router.push('/preferences/general')
    })
  },
  removeShortcutsEvents: () => {
    ipcRenderer.removeAllListeners('open-preferences')
  },
  loadPreferences: ({ commit, dispatch }) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('get-preferences')
      ipcRenderer.once('error-get-preferences', (_, err: Error) => {
        ipcRenderer.removeAllListeners('response-get-preferences')
        reject(err)
      })
      ipcRenderer.once('response-get-preferences', (_, conf: any) => {
        ipcRenderer.removeAllListeners('error-get-preferences')
        dispatch('updateTheme', conf.appearance as any)
        commit(MUTATION_TYPES.UPDATE_DISPLAY_NAME_STYLE, conf.appearance.displayNameStyle as number)
        commit(MUTATION_TYPES.UPDATE_FONT_SIZE, conf.appearance.fontSize as number)
        commit(MUTATION_TYPES.UPDATE_NOTIFY, conf.notification.notify as Notify)
        commit(MUTATION_TYPES.UPDATE_TIME_FORMAT, conf.appearance.timeFormat as number)
        commit(MUTATION_TYPES.UPDATE_LANGUAGE, conf.language.language as string)
        commit(MUTATION_TYPES.ADD_FONT, conf.appearance.font as string)
        commit(MUTATION_TYPES.UPDATE_IGNORE_CW, conf.general.timeline.cw as boolean)
        commit(MUTATION_TYPES.UPDATE_IGNORE_NFSW, conf.general.timeline.nfsw as boolean)
        commit(MUTATION_TYPES.UPDATE_HIDE_ALL_ATTACHMENTS, conf.general.timeline.hideAllAttachments as boolean)
        resolve(conf)
      })
    })
  },
  updateTheme: ({ commit }, appearance: any) => {
    const themeKey: string = appearance.theme
    switch (themeKey) {
      case Theme.Light.key:
        commit(MUTATION_TYPES.UPDATE_THEME, LightTheme)
        break
      case Theme.Dark.key:
        commit(MUTATION_TYPES.UPDATE_THEME, DarkTheme)
        break
      case Theme.SolarizedLight.key:
        commit(MUTATION_TYPES.UPDATE_THEME, SolarizedLightTheme)
        break
      case Theme.SolarizedDark.key:
        commit(MUTATION_TYPES.UPDATE_THEME, SolarizedDarkTheme)
        break
      case Theme.KimbieDark.key:
        commit(MUTATION_TYPES.UPDATE_THEME, KimbieDarkTheme)
        break
      case Theme.Custom.key:
        commit(MUTATION_TYPES.UPDATE_THEME, appearance.customThemeColor)
        break
      default:
        commit(MUTATION_TYPES.UPDATE_THEME, LightTheme)
        break
    }
  }
}

const App: Module<AppState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default App
