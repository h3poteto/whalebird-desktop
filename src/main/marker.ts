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
          acct: marker.acct,
          timeline: marker.timeline
        },
        { $set: marker },
        { multi: false },
        err => {
          if (err) return reject(err)
          return this.get(marker.acct, marker.timeline)
        }
      )
    })
  }

  public async save(marker: LocalMarker): Promise<LocalMarker> {
    return this.get(marker.acct, marker.timeline).then(l => {
      if (isEmpty(l)) return this.insert(marker)
      return this.update(marker)
    })
  }

  public async get(acct: string, timeline: 'home' | 'notifications'): Promise<LocalMarker> {
    return new Promise((resolve, reject) => {
      this.db.findOne<LocalMarker>({ acct: acct, timeline: timeline }, (err, doc) => {
        if (err) return reject(err)
        resolve(doc)
      })
    })
  }

  public async list(acct: string): Promise<Array<LocalMarker>> {
    return new Promise((resolve, reject) => {
      this.db
        .find<LocalMarker>({ acct: acct })
        .exec((err, docs) => {
          if (err) return reject(err)
          resolve(docs)
        })
    })
  }
}
