import { Entity } from 'megalodon'

export type Marker = {
  last_read_id: string
  version: number
  updated_at: string
  unread_count?: number
}

export function unreadCount(marker: Marker, notifications: Array<Entity.Notification>): number {
  if (marker.unread_count !== undefined) {
    return marker.unread_count
  }
  return notifications.filter(n => parseInt(n.id) > parseInt(marker.last_read_id)).length
}
