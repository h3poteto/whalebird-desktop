import { isEmpty } from 'lodash'
import Loki, { Collection } from 'lokijs'
import { LocalMarker } from '~/src/types/localMarker'

export default class Marker {
  private markers: Collection<any>

  constructor(db: Loki) {
    this.markers = db.getCollection('markers')
  }

  private insert(marker: LocalMarker): Promise<LocalMarker> {
    return new Promise((resolve, reject) => {
      try {
        const doc: LocalMarker = this.markers.insert(marker)
        resolve(doc)
      } catch (err) {
        reject(err)
      }
    })
  }

  private update(marker: LocalMarker): Promise<LocalMarker> {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      try {
        this.markers.findAndUpdate(
          {
            owner_id: { $eq: marker.owner_id },
            timeline: { $eq: marker.timeline }
          },
          (item: LocalMarker) => {
            item.last_read_id = marker.last_read_id
          }
        )
        return this.get(marker.owner_id, marker.timeline)
      } catch (err) {
        reject(err)
      }
    })
  }

  public async save(marker: LocalMarker): Promise<LocalMarker> {
    return this.get(marker.owner_id, marker.timeline).then(l => {
      if (isEmpty(l)) return this.insert(marker)
      return this.update(marker)
    })
  }

  public async get(owner_id: string, timeline: 'home' | 'notifications'): Promise<LocalMarker | null> {
    return new Promise((resolve, reject) => {
      try {
        const doc: LocalMarker | null = this.markers.findOne({
          owner_id: { $eq: owner_id },
          timeline: { $eq: timeline }
        })
        resolve(doc)
      } catch (err) {
        reject(err)
      }
    })
  }

  public async list(owner_id: string): Promise<Array<LocalMarker>> {
    return new Promise((resolve, reject) => {
      try {
        const docs: Array<LocalMarker> = this.markers.find({
          owner_id: { $eq: owner_id }
        })
        resolve(docs)
      } catch (err) {
        reject(err)
      }
    })
  }
}
