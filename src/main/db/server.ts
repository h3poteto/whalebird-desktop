import sqlite3 from 'sqlite3'
import { LocalServer } from '~/src/types/localServer'

export const insertServer = (
  db: sqlite3.Database,
  baseURL: string,
  domain: string,
  sns: 'mastodon' | 'pleroma' | 'misskey',
  accountId: number | null
): Promise<LocalServer> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('INSERT INTO servers(domain, base_url, sns, account_id) values (?, ?, ?, ?)', [domain, baseURL, sns, accountId], function (
        err
      ) {
        if (err) {
          reject(err)
        }
        resolve({
          id: this.lastID,
          baseURL,
          domain,
          sns,
          accountId
        })
      })
    })
  })
}

export const getServer = (db: sqlite3.Database, id: number): Promise<LocalServer> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, base_url, domain, sns, account_id FROM servers WHERE id = ?', id, (err, r) => {
      if (err) reject(err)
      resolve({
        id: r.id,
        baseURL: r.base_url,
        domain: r.domain,
        sns: r.sns,
        accountId: r.account_id
      } as LocalServer)
    })
  })
}
