import empty from 'is-empty'

export default class Account {
  constructor (db) {
    this.db = db
  }

  listInstances () {
    return new Promise((resolve, reject) => {
      this.db.find({accessToken: { $ne: '' }}, (err, doc) => {
        if (err) return reject(err)
        if (empty(doc)) return reject(new EmptyRecordError('empty'))
        const instances = doc.map((e, i, array) => {
          return { baseURL: e.baseURL, id: e._id }
        })
        resolve(instances)
      })
    })
  }

  getInstance (id) {
    return new Promise((resolve, reject) => {
      this.db.findOne(
        {
          _id: id
        },
        (err, doc) => {
          if (err) return reject(err)
          if (empty(doc)) return reject(new EmptyRecordError('empty'))
          const instance = {
            baseURL: doc.baseURL,
            id: doc.id
          }
          resolve(instance)
        }
      )
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
