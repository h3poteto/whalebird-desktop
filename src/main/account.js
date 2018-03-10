import empty from 'is-empty'

export default class Account {
  constructor (db) {
    this.db = db
  }

  listAccounts () {
    return new Promise((resolve, reject) => {
      this.db.find({accessToken: { $ne: '' }}, (err, docs) => {
        if (err) return reject(err)
        if (empty(docs)) return reject(new EmptyRecordError('empty'))
        resolve(docs)
      })
    })
  }

  getAccount (id) {
    return new Promise((resolve, reject) => {
      this.db.findOne(
        {
          _id: id
        },
        (err, doc) => {
          if (err) return reject(err)
          if (empty(doc)) return reject(new EmptyRecordError('empty'))
          resolve(doc)
        }
      )
    })
  }
}

class EmptyRecordError {
  constructor (message) {
    this.message = message
  }
}
