export type LocalMarker = {
  owner_id: string
  timeline: 'home' | 'notifications' | 'mentions'
  last_read_id: string
}
