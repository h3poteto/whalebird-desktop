import empty from 'is-empty'

export default class Account {
  constructor (db) {
    this.db = db
  }

  insertAccount (obj) {
    return new Promise((resolve, reject) => {
      this.db.insert(obj, (err, doc) => {
        if (err) return reject(err)
        if (empty(doc)) return reject(new EmptyRecordError('empty'))
        resolve(doc)
      })
    })
  }

  listAccounts () {
    return new Promise((resolve, reject) => {
      this.db.find({accessToken: { $ne: '' }}).sort({ order: 1 }).exec((err, docs) => {
        if (err) return reject(err)
        if (empty(docs)) return reject(new EmptyRecordError('empty'))
        resolve(docs)
      })
    })
  }

  countAuthorizedAccounts () {
    return new Promise((resolve, reject) => {
      this.db.count({accessToken: { $ne: '' }}, (err, count) => {
        if (err) return reject(err)
        resolve(count)
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

  searchAccount (obj) {
    return new Promise((resolve, reject) => {
      this.db.findOne(
        obj,
        (err, doc) => {
          if (err) return reject(err)
          if (empty(doc)) return reject(new EmptyRecordError('empty'))
          resolve(doc)
        })
    })
  }

  updateAccount (id, obj) {
    return new Promise((resolve, reject) => {
      this.db.update(
        {
          _id: id
        },
        { $set: Object.assign(obj, { _id: id }) },
        { multi: true },
        (err, numReplaced) => {
          if (err) return reject(err)
          this.db.findOne(
            {
              _id: id
            },
            (err, doc) => {
              if (err) return reject(err)
              if (empty(doc)) return reject(new EmptyRecordError('empty'))
              resolve(doc)
            })
        }
      )
    })
  }

  removeAccount (id) {
    return new Promise((resolve, reject) => {
      this.db.remove(
        {
          _id: id
        },
        { multi: true },
        (err, numRemoved) => {
          if (err) return reject(err)
          resolve(numRemoved)
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
