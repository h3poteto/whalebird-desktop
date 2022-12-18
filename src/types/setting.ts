export type UnreadNotification = {
  direct: boolean
  local: boolean
  public: boolean
}

export type UseMarker = {
  home: boolean
  notifications: boolean
}

export type Timeline = {
  unreadNotification: UnreadNotification
  useMarker: UseMarker
}
export type Setting = {
  accountID: string
  timeline: Timeline
}

export type BaseSettings = Array<Setting>
