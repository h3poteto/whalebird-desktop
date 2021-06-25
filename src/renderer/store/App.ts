import { MutationTree, ActionTree, Module } from 'vuex'
import router from '@/router'
import { LightTheme, DarkTheme, SolarizedLightTheme, SolarizedDarkTheme, KimbieDarkTheme, ThemeColorType } from '~/src/constants/themeColor'
import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import TimeFormat from '~/src/constants/timeFormat'
import Language from '~/src/constants/language'
import DefaultFonts from '@/utils/fonts'
import { RootState } from '@/store'
import { Notify } from '~/src/types/notify'
import { BaseConfig } from '~/src/types/preference'
import { Appearance } from '~/src/types/appearance'
import { MyWindow } from '~/src/types/global'

const win = (window as any) as MyWindow

export type AppState = {
  theme: ThemeColorType
  fontSize: number
  displayNameStyle: number
  notify: Notify
  timeFormat: number
  language: string
  defaultFonts: Array<string>
  ignoreCW: boolean
  ignoreNSFW: boolean
  hideAllAttachments: boolean
  tootPadding: number
  userAgent: string
  useMarker: boolean
}

const state = (): AppState => ({
  theme: LightTheme,
  fontSize: 14,
  displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
  notify: {
    reply: true,
    reblog: true,
    favourite: true,
    follow: true,
    follow_request: true,
    reaction: true,
    status: true,
    poll_vote: true,
    poll_expired: true
  },
  tootPadding: 8,
  timeFormat: TimeFormat.Absolute.value,
  language: Language.en.key,
  defaultFonts: DefaultFonts,
  ignoreCW: false,
  ignoreNSFW: false,
  hideAllAttachments: false,
  userAgent: 'Whalebird',
  useMarker: false
})

const MUTATION_TYPES = {
  UPDATE_THEME: 'updateTheme',
  UPDATE_FONT_SIZE: 'updateFontSize',
  UPDATE_DISPLAY_NAME_STYLE: 'updateDisplayNameStyle',
  UPDATE_NOTIFY: 'updateNotify',
  UPDATE_TOOT_PADDING: 'updateTootPadding',
  UPDATE_TIME_FORMAT: 'updateTimeFormat',
  UPDATE_LANGUAGE: 'updateLanguage',
  ADD_FONT: 'addFont',
  UPDATE_IGNORE_CW: 'updateIgnoreCW',
  UPDATE_IGNORE_NSFW: 'updateIgnoreNSFW',
  UPDATE_HIDE_ALL_ATTACHMENTS: 'updateHideAllAttachments',
  UPDATE_USE_MARKER: 'updateUseMarker'
}

const mutations: MutationTree<AppState> = {
  [MUTATION_TYPES.UPDATE_THEME]: (state: AppState, themeColorList: ThemeColorType) => {
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
  [MUTATION_TYPES.UPDATE_TOOT_PADDING]: (state: AppState, value: number) => {
    state.tootPadding = value
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
  [MUTATION_TYPES.UPDATE_IGNORE_NSFW]: (state: AppState, nsfw: boolean) => {
    state.ignoreNSFW = nsfw
  },
  [MUTATION_TYPES.UPDATE_HIDE_ALL_ATTACHMENTS]: (state: AppState, hideAllAttachments: boolean) => {
    state.hideAllAttachments = hideAllAttachments
  },
  [MUTATION_TYPES.UPDATE_USE_MARKER]: (state: AppState, useMarker: boolean) => {
    state.useMarker = useMarker
  }
}

const actions: ActionTree<AppState, RootState> = {
  watchShortcutsEvents: () => {
    win.ipcRenderer.on('open-preferences', () => {
      router.push('/preferences/general')
    })
  },
  removeShortcutsEvents: () => {
    win.ipcRenderer.removeAllListeners('open-preferences')
  },
  loadPreferences: async ({ commit, dispatch }) => {
    const conf: BaseConfig = await win.ipcRenderer.invoke('get-preferences')
    dispatch('updateTheme', conf.appearance)
    commit(MUTATION_TYPES.UPDATE_DISPLAY_NAME_STYLE, conf.appearance.displayNameStyle)
    commit(MUTATION_TYPES.UPDATE_FONT_SIZE, conf.appearance.fontSize)
    commit(MUTATION_TYPES.UPDATE_NOTIFY, conf.notification.notify)
    commit(MUTATION_TYPES.UPDATE_TIME_FORMAT, conf.appearance.timeFormat)
    commit(MUTATION_TYPES.UPDATE_LANGUAGE, conf.language.language)
    commit(MUTATION_TYPES.UPDATE_TOOT_PADDING, conf.appearance.tootPadding)
    commit(MUTATION_TYPES.ADD_FONT, conf.appearance.font)
    commit(MUTATION_TYPES.UPDATE_IGNORE_CW, conf.general.timeline.cw)
    commit(MUTATION_TYPES.UPDATE_IGNORE_NSFW, conf.general.timeline.nsfw)
    commit(MUTATION_TYPES.UPDATE_HIDE_ALL_ATTACHMENTS, conf.general.timeline.hideAllAttachments)
    commit(MUTATION_TYPES.UPDATE_USE_MARKER, conf.general.timeline.useMarker)
    return conf
  },
  updateTheme: ({ commit }, appearance: Appearance) => {
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
