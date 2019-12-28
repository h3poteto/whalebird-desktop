import storage from 'electron-json-storage'
import log from 'electron-log'
import objectAssignDeep from 'object-assign-deep'
import DisplayStyle from '../constants/displayStyle'
import Theme from '../constants/theme'
import Language from '../constants/language'
import TimeFormat from '../constants/timeFormat'
import { LightTheme } from '~/src/constants/themeColor'
import DefaultFonts from '../renderer/utils/fonts'
import { Sound } from '~/src/types/sound'
import { Timeline } from '~/src/types/timeline'
import { Notify } from '~/src/types/notify'
import { Appearance } from '~/src/types/appearance'
import { Language as LanguageSet } from '~/src/types/language'
import { General, State, Notification, BaseConfig, Other } from '~/src/types/preference'
import { Proxy, ProxySource } from '~/src/types/proxy'

const sound: Sound = {
  fav_rb: true,
  toot: true
}

const timeline: Timeline = {
  cw: false,
  nfsw: false,
  hideAllAttachments: false
}

const other: Other = {
  launch: false
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
  follow: true
}

const language: LanguageSet = {
  language: Language.en.key
}

const notification: Notification = {
  notify: notify
}

const appearance: Appearance = {
  theme: Theme.Light.key,
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

const Base: BaseConfig = {
  general: general,
  state: state,
  language: language,
  notification: notification,
  appearance: appearance,
  proxy: proxy
}

export default class Preferences {
  private path: string

  constructor(path: string) {
    this.path = path
  }

  public async load(): Promise<BaseConfig> {
    try {
      const preferences = await this._get()
      return objectAssignDeep({}, Base, preferences)
    } catch (err) {
      log.error(err)
      return Base
    }
  }

  private _get(): Promise<BaseConfig> {
    return new Promise((resolve, reject) => {
      storage.get(this.path, (err, data) => {
        if (err) return reject(err)
        return resolve(data as BaseConfig)
      })
    })
  }

  private _save(data: BaseConfig): Promise<BaseConfig> {
    return new Promise((resolve, reject) => {
      storage.set(this.path, data, err => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }

  public async update(obj: any): Promise<BaseConfig> {
    const current = await this.load()
    const data = objectAssignDeep({}, current, obj)
    const result = await this._save(data)
    return result
  }
}
