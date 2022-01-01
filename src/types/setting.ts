export type UnreadNotification = {
  direct: boolean
  local: boolean
  public: boolean
}

export type Timeline = {
  unreadNotification: UnreadNotification
}
export type Setting = {
  accountID: string
  timeline: Timeline
}

export type BaseSettings = Array<Setting>
