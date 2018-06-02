export default class Hashtags {
  constructor (db) {
    this.db = db
    this.db.ensureIndex({fieldName: 'tagName', unique: true}, (_) => {})
  }

  listTags () {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, docs) => {
        if (err) return reject(err)
        resolve(docs)
      })
    })
  }

  insertTag (tag) {
    return new Promise((resolve, reject) => {
      this.db.insert({tagName: tag}, (err, doc) => {
        if (err) return reject(err)
        resolve(doc)
      })
    })
  }

  removeTag (tag) {
    return new Promise((resolve, reject) => {
      this.db.remove(
        {
          tagName: tag.tagName
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
