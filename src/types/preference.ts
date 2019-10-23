import { Sound } from '~/src/types/sound'
import { Timeline } from '~/src/types/timeline'
import { Notify } from '~/src/types/notify'
import { Appearance } from '~/src/types/appearance'
import { Language } from '~/src/types/language'
import { Proxy } from '~/src/types/proxy'

export type Other = {
  launch: boolean
}

export type General = {
  sound: Sound
  timeline: Timeline
  other: Other
}

export type State = {
  collapse: boolean
  hideGlobalHeader: boolean
}

export type Notification = {
  notify: Notify
}

export type BaseConfig = {
  general: General
  state: State
  language: Language
  notification: Notification
  appearance: Appearance
  proxy: Proxy
}
