import { isEmpty } from 'lodash'
import Datastore from 'nedb'

export default class UnreadNotification {
  constructor (path) {
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
          resolve(null)
        })
      })
    })
  }

  insertOrUpdate (accountID, obj) {
    return new Promise((resolve, reject) => {
      this.db.update(
        {
          accountID: accountID
        },
        obj,
        {
          upsert: true
        },
        (err, num) => {
          if (err) return reject(err)
          resolve(num)
        })
    })
  }

  findOne (obj) {
    return new Promise((resolve, reject) => {
      this.db.findOne(obj, (err, doc) => {
        if (err) return reject(err)
        if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
        resolve(doc)
      })
    })
  }
}

class EmptyRecordError extends Error {
  constructor (msg) {
    super(msg)
    this.name = 'EmptyRecordError'
  }
}
