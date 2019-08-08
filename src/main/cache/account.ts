import { isEmpty } from 'lodash'
import Datastore from 'nedb'
import { CachedAccount } from '~/src/types/cachedAccount'

export default class AccountCache {
  private db: Datastore

  constructor(path: string) {
    this.db = new Datastore({
      filename: path,
      autoload: true
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
        if (err) return reject(err)
        if (!isEmpty(doc)) return reject(new Error('Record already exists'))
        this.db.insert<CachedAccount>({ owner_id: ownerID, acct: acct }, (err, doc) => {
          if (err) return reject(err)
          resolve(doc)
        })
      })
    })
  }
}
