import { isEmpty } from 'lodash'
import Datastore from 'nedb'
import { LocalMarker } from '~/src/types/localMarker'

export default class Marker {
  private db: Datastore

  constructor(db: Datastore) {
    this.db = db
    this.db.persistence.setAutocompactionInterval(60000) // milliseconds
  }

  private insert(marker: LocalMarker): Promise<LocalMarker> {
    return new Promise((resolve, reject) => {
      this.db.insert(marker, (err, doc) => {
        if (err) return reject(err)
        resolve(doc)
      })
    })
  }

  private update(marker: LocalMarker): Promise<LocalMarker> {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      this.db.update(
        {
          owner_id: marker.owner_id,
          timeline: marker.timeline
        },
        { $set: marker },
        { multi: false },
        err => {
          if (err) return reject(err)
          return this.get(marker.owner_id, marker.timeline)
        }
      )
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
      this.db.findOne<LocalMarker>({ owner_id: owner_id, timeline: timeline }, (err, doc) => {
        if (err) return reject(err)
        resolve(doc)
      })
    })
  }

  public async list(owner_id: string): Promise<Array<LocalMarker>> {
    return new Promise((resolve, reject) => {
      this.db
        .find<LocalMarker>({ owner_id: owner_id })
        .exec((err, docs) => {
          if (err) return reject(err)
          resolve(docs)
        })
    })
  }
}
