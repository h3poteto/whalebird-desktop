export type LocalMarker = {
  owner_id: number
  timeline: 'home' | 'notifications' | 'mentions'
  last_read_id: string
}
