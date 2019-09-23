import storage from 'electron-json-storage'
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

const Base: BaseConfig = {
  general: general,
  state: state,
  language: language,
  notification: notification,
  appearance: appearance
}

export default class Preferences {
  private path: string

  constructor(path: string) {
    this.path = path
  }

  async load(): Promise<BaseConfig> {
    try {
      const preferences = await this.get()
      return objectAssignDeep({}, Base, preferences)
    } catch (err) {
      return Base
    }
  }

  get(): Promise<BaseConfig> {
    return new Promise((resolve, reject) => {
      storage.get(this.path, (err, data) => {
        if (err) return reject(err)
        return resolve(data as BaseConfig)
      })
    })
  }

  save(data: BaseConfig): Promise<BaseConfig> {
    return new Promise((resolve, reject) => {
      storage.set(this.path, data, err => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }

  async update(obj: any): Promise<BaseConfig> {
    const current = await this.load()
    const data = objectAssignDeep({}, current, obj)
    const result = await this.save(data)
    return result
  }
}
