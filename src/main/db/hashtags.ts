import { Database } from 'better-sqlite3'
import { LocalTag } from '~/src/types/localTag'

export const listTags = (db: Database, accountId: number): Promise<Array<LocalTag>> => {
  return new Promise(resolve => {
    const rows = db.prepare('SELECT * FROM hashtags WHERE account_id = ?').all(accountId)

    resolve(
      rows.map(r => ({
        id: r.id,
        tagName: r.tag,
        accountId: r.account_id
      }))
    )
  })
}

export const insertTag = (db: Database, accountId: number, tag: string): Promise<LocalTag> => {
  return new Promise((resolve, reject) => {
    const f = db.transaction(() => {
      const row = db.prepare('SELECT * FROM hashtags WHERE id = ? AND tag = ?').get(accountId, tag)

      if (row) {
        resolve({
          id: row.id,
          tagName: row.tag,
          accountId: row.account_id
        })
      }

      try {
        const res = db.prepare('INSERT INTO hashtags(tag, account_id) VALUES (?, ?)').run(accountId, tag)
        return resolve({
          id: res.lastInsertRowid as number,
          tagName: tag,
          accountId: accountId
        })
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
    f()
  })
}

export const removeTag = (db: Database, tag: LocalTag): Promise<null> => {
  return new Promise((resolve, reject) => {
    db.prepare('PRAGMA foreign_keys = ON').run()

    try {
      db.prepare('DELETE FROM hashtags WHERE id = ?').run(tag.id)
      resolve(null)
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
