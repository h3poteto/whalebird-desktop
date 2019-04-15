export type UnreadNotificationType = {
  default: boolean
}

export type UnreadNotificationList = {
  Direct: UnreadNotificationType,
  Local: UnreadNotificationType,
  Public: UnreadNotificationType
}

declare var u: UnreadNotificationList

export default u
