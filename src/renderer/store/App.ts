import { ipcRenderer } from 'electron'
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
import { ManualProxy, ProxyProtocol } from '~/src/types/proxy'
import { ProxyConfig } from 'megalodon'

export type AppState = {
  theme: ThemeColorType
  fontSize: number
  displayNameStyle: number
  notify: Notify
  timeFormat: number
  language: string
  defaultFonts: Array<string>
  ignoreCW: boolean
  ignoreNFSW: boolean
  hideAllAttachments: boolean
  tootPadding: number
  proxyConfiguration: ProxyConfig | false
  userAgent: string
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
  tootPadding: 8,
  timeFormat: TimeFormat.Absolute.value,
  language: Language.en.key,
  defaultFonts: DefaultFonts,
  ignoreCW: false,
  ignoreNFSW: false,
  hideAllAttachments: false,
  proxyConfiguration: false,
  userAgent: 'Whalebird'
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
  UPDATE_IGNORE_NFSW: 'updateIgnoreNFSW',
  UPDATE_HIDE_ALL_ATTACHMENTS: 'updateHideAllAttachments',
  UPDATE_PROXY_CONFIGURATION: 'updateProxyConfiguration'
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
  [MUTATION_TYPES.UPDATE_IGNORE_NFSW]: (state: AppState, nfsw: boolean) => {
    state.ignoreNFSW = nfsw
  },
  [MUTATION_TYPES.UPDATE_HIDE_ALL_ATTACHMENTS]: (state: AppState, hideAllAttachments: boolean) => {
    state.hideAllAttachments = hideAllAttachments
  },
  [MUTATION_TYPES.UPDATE_PROXY_CONFIGURATION]: (state, proxy: ManualProxy | false) => {
    if (!proxy) {
      state.proxyConfiguration = false
    } else {
      let protocol = ProxyProtocol.http
      if (proxy.protocol !== '') {
        protocol = proxy.protocol
      }
      if (proxy.username.length > 0) {
        state.proxyConfiguration = {
          host: proxy.host,
          port: parseInt(proxy.port, 10),
          protocol: protocol,
          auth: {
            username: proxy.username,
            password: proxy.password
          }
        }
      } else {
        state.proxyConfiguration = {
          host: proxy.host,
          port: parseInt(proxy.port, 10),
          protocol: protocol
        }
      }
    }
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
      ipcRenderer.once('response-get-preferences', (_, conf: BaseConfig) => {
        ipcRenderer.removeAllListeners('error-get-preferences')
        dispatch('updateTheme', conf.appearance)
        commit(MUTATION_TYPES.UPDATE_DISPLAY_NAME_STYLE, conf.appearance.displayNameStyle)
        commit(MUTATION_TYPES.UPDATE_FONT_SIZE, conf.appearance.fontSize)
        commit(MUTATION_TYPES.UPDATE_NOTIFY, conf.notification.notify)
        commit(MUTATION_TYPES.UPDATE_TIME_FORMAT, conf.appearance.timeFormat)
        commit(MUTATION_TYPES.UPDATE_LANGUAGE, conf.language.language)
        commit(MUTATION_TYPES.UPDATE_TOOT_PADDING, conf.appearance.tootPadding)
        commit(MUTATION_TYPES.ADD_FONT, conf.appearance.font)
        commit(MUTATION_TYPES.UPDATE_IGNORE_CW, conf.general.timeline.cw)
        commit(MUTATION_TYPES.UPDATE_IGNORE_NFSW, conf.general.timeline.nfsw)
        commit(MUTATION_TYPES.UPDATE_HIDE_ALL_ATTACHMENTS, conf.general.timeline.hideAllAttachments)
        resolve(conf)
      })
    })
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
  },
  loadProxy: ({ commit }) => {
    return new Promise(resolve => {
      ipcRenderer.once('response-get-proxy-configuration', (_, proxy: ManualProxy | false) => {
        commit(MUTATION_TYPES.UPDATE_PROXY_CONFIGURATION, proxy)
        resolve(proxy)
      })
      ipcRenderer.send('get-proxy-configuration')
    })
  }
}

const App: Module<AppState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default App
