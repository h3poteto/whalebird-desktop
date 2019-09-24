import { isEmpty } from 'lodash'
import Datastore from 'nedb'
import fs from 'fs'
import { CachedAccount } from '~/src/types/cachedAccount'

export default class AccountCache {
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
  }

  listAccounts(ownerID: string): Promise<Array<CachedAccount>> {
    return new Promise((resolve, reject) => {
      this.db.find<CachedAccount>({ owner_id: ownerID }, (err, docs) => {
        if (err) return reject(err)
        resolve(docs)
      })
    })
  }

  insertAccount(ownerID: string, acct: string): Promise<CachedAccount> {
    return new Promise((resolve, reject) => {
      // At first confirm records for unique.
      this.db.findOne<CachedAccount>({ owner_id: ownerID, acct: acct }, (err, doc) => {
        if (err) return err
        // Ignore error for unique constraints.
        if (!isEmpty(doc)) return err
        return this.db.insert<CachedAccount>({ owner_id: ownerID, acct: acct }, (err, doc) => {
          if (err) return reject(err)
          return resolve(doc)
        })
      })
    })
  }
}
