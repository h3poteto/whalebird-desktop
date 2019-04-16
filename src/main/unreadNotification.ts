import { isEmpty } from 'lodash'
import Datastore from 'nedb'
import { UnreadNotification as Config } from '~/src/types/unreadNotification'

export default class UnreadNotification {
  private db: Datastore

  constructor (path: string) {
    this.db = new Datastore({
      filename: path,
      autoload: true
    })
  }

  async initialize () {
    await this.updateUnique()
  }

  updateUnique () {
    return new Promise((resolve, reject) => {
      // At first, remove old index.
      this.db.removeIndex('accountID', (err) => {
        if (err) reject(err)
        // Add unique index.
        this.db.ensureIndex({ fieldName: 'accountID', unique: true, sparse: true }, (err) => {
          if (err) reject(err)
          resolve({})
        })
      })
    })
  }

  insertOrUpdate (accountID: string, config: Config): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.update(
        {
          accountID: accountID
        },
        config,
        {
          upsert: true
        },
        (err, num) => {
          if (err) return reject(err)
          resolve(num)
        })
    })
  }

  findOne (obj: any): Promise<Config> {
    return new Promise((resolve, reject) => {
      this.db.findOne<Config>(obj, (err, doc) => {
        if (err) return reject(err)
        if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
        resolve(doc)
      })
    })
  }
}

class EmptyRecordError extends Error {}
