import { Database } from 'better-sqlite3'
import { LocalServer } from '~/src/types/localServer'

export const insertServer = (
  db: Database,
  baseURL: string,
  domain: string,
  sns: 'mastodon' | 'pleroma' | 'firefish' | 'friendica',
  accountId: number | null
): Promise<LocalServer> => {
  return new Promise((resolve, reject) => {
    try {
      const res = db
        .prepare('INSERT INTO servers(domain, base_url, sns, account_id) values (?, ?, ?, ?)')
        .run(domain, baseURL, sns, accountId)
      resolve({
        id: res.lastInsertRowid as number,
        baseURL,
        domain,
        sns,
        accountId
      })
    } catch (err) {
      reject(err)
    }
  })
}

export const getServer = (db: Database, id: number): Promise<LocalServer> => {
  return new Promise((resolve, reject) => {
    const row = db.prepare('SELECT id, base_url, domain, sns, account_id FROM servers WHERE id = ?').get(id)
    if (row) {
      resolve({
        id: row.id,
        baseURL: row.base_url,
        domain: row.domain,
        sns: row.sns,
        accountId: row.account_id
      } as LocalServer)
    } else {
      reject()
    }
  })
}
