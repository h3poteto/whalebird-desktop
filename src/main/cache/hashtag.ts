import Datastore from 'nedb'
import fs from 'fs'
import { LocalTag } from '~/src/types/localTag'

export default class HashtagCache {
  private db: Datastore

  constructor(path: string) {
    this.db = new Datastore({
      filename: path,
      autoload: true,
      onload: (err: Error) => {
        if (err) {
          fs.unlink(path, err => {
            if (err) {
              console.error(err)
            }
          })
        }
      }
    })
    this.db.ensureIndex({ fieldName: 'tagName', unique: true, sparse: true }, err => {
      if (err) console.error(err)
    })
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
    return new Promise((resolve, reject) => {
      // Ignore error for unique constraints.
      this.db.insert({ tagName: tag }, (err, doc) => {
        if (err) return reject(err)
        resolve(doc)
      })
    })
  }
}
