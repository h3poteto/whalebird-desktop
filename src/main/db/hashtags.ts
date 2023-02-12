import sqlite3 from 'sqlite3'
import { LocalTag } from '~/src/types/localTag'

export const listTags = (db: sqlite3.Database, accountId: number): Promise<Array<LocalTag>> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM hashtags WHERE account_id = ?', accountId, (err, rows) => {
      if (err) {
        reject(err)
      }
      resolve(
        rows.map(r => ({
          id: r.id,
          tagName: r.tag,
          accountId: r.account_id
        }))
      )
    })
  })
}

export const insertTag = (db: sqlite3.Database, accountId: number, tag: string): Promise<LocalTag> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')

      db.get('SELECT * FROM hashtags WHERE id = ? AND tag = ?', [accountId, tag], (err, row) => {
        if (err) {
          reject(err)
        }
        if (row) {
          resolve({
            id: row.id,
            tagName: row.tag,
            accountId: row.account_id
          })
        }

        db.run('INSERT INTO hashtags(tag, account_id) VALUES (?, ?)', [accountId, tag], function (err) {
          if (err) {
            reject(err)
          }
          db.run('COMMIT')
          resolve({
            id: this.lastID,
            tagName: tag,
            accountId: accountId
          })
        })
      })
    })
  })
}

export const removeTag = (db: sqlite3.Database, tag: LocalTag): Promise<null> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON')

      db.run('DELETE FROM hashtags WHERE id = ?', tag.id, err => {
        if (err) {
          reject(err)
        }
        resolve(null)
      })
    })
  })
}
