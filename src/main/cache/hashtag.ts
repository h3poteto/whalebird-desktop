import Datastore from 'nedb'
import { LocalTag } from '~/src/types/localTag'

export default class HashtagCache {
  private db: Datastore

  constructor(path: string) {
    this.db = new Datastore({
      filename: path,
      autoload: true
    })
    this.db.ensureIndex({ fieldName: 'tagName', unique: true }, _ => {})
  }

  listTags(): Promise<Array<LocalTag>> {
    return new Promise((resolve, reject) => {
      this.db.find<LocalTag>({}, (err, docs) => {
        if (err) return reject(err)
        resolve(docs)
      })
    })
  }

  insertHashtag(tag: string): Promise<LocalTag> {
    return new Promise(resolve => {
      // Ignore error for unique constraints.
      this.db.insert({ tagName: tag }, (_, doc) => {
        resolve(doc)
      })
    })
  }
}
