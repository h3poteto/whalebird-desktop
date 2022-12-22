import DisplayStyle from '~/src/constants/displayStyle'
import Theme from '~/src/constants/theme'
import Language from '~/src/constants/language'
import TimeFormat from '~/src/constants/timeFormat'
import { LightTheme } from '~/src/constants/themeColor'
import DefaultFonts from '~/src/renderer/utils/fonts'
import { Sound } from '~/src/types/sound'
import { Timeline } from '~/src/types/timeline'
import { Notify } from '~/src/types/notify'
import { Appearance } from '~/src/types/appearance'
import { Language as LanguageSet } from '~/src/types/language'
import { General, State, Notification, BaseConfig, Other, Menu } from '~/src/types/preference'
import { Proxy, ProxySource } from '~/src/types/proxy'

const sound: Sound = {
  fav_rb: true,
  toot: true
}

const timeline: Timeline = {
  cw: false,
  nsfw: false,
  hideAllAttachments: false
}

const other: Other = {
  launch: false,
  hideOnLaunch: false
}

const general: General = {
  sound: sound,
  timeline: timeline,
  other: other
}

const state: State = {
  collapse: false,
  hideGlobalHeader: false
}

const notify: Notify = {
  reply: true,
  reblog: true,
  favourite: true,
  follow: true,
  follow_request: true,
  reaction: true,
  status: true,
  poll_vote: true,
  poll_expired: true
}

const language: LanguageSet = {
  language: Language.en.key,
  spellchecker: {
    enabled: true,
    languages: [Language.en.key]
  }
}

const notification: Notification = {
  notify: notify
}

const appearance: Appearance = {
  theme: Theme.System.key,
  fontSize: 14,
  displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
  timeFormat: TimeFormat.Absolute.value,
  customThemeColor: LightTheme,
  font: DefaultFonts[0],
  tootPadding: 8
}

const proxy: Proxy = {
  source: ProxySource.system,
  manualProxyConfig: {
    protocol: '',
    host: '',
    port: '',
    username: '',
    password: ''
  }
}

const menu: Menu = {
  autoHideMenu: false
}

export const Base: BaseConfig = {
  general: general,
  state: state,
  language: language,
  notification: notification,
  appearance: appearance,
  proxy: proxy,
  menu: menu
}
