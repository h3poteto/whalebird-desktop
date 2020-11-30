export type UnreadNotificationType = {
  default: boolean
}

export type UnreadNotificationList = {
  Direct: UnreadNotificationType,
  Local: UnreadNotificationType,
  Public: UnreadNotificationType
}

declare let u: UnreadNotificationList

export default u
