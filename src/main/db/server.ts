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
