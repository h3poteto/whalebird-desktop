import { Setting, Timeline, UnreadNotification } from '~/src/types/setting'

const unreadNotification: UnreadNotification = {
  direct: false,
  local: true,
  public: false
}

const timeline: Timeline = {
  unreadNotification: unreadNotification
}

export const Base: Setting = {
  accountID: '',
  timeline: timeline
}
