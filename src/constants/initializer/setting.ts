import { Setting, Timeline, UnreadNotification, UseMarker } from '~/src/types/setting'

const unreadNotification: UnreadNotification = {
  direct: false,
  local: true,
  public: false
}

const useMarker: UseMarker = {
  home: false,
  notifications: true,
  mentions: false
}

const timeline: Timeline = {
  unreadNotification: unreadNotification,
  useMarker: useMarker
}

export const DefaultSetting: Setting = {
  accountID: '',
  timeline: timeline
}
