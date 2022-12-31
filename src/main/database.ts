import sqlite3 from 'sqlite3'

const newDB = (file: string): sqlite3.Database => {
  let db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)

  // migration
  db.serialize(() => {
    db.run(
      'CREATE TABLE IF NOT EXISTS accounts(\
id INTEGER PRIMARY KEY, \
username TEXT NOT NULL, \
account_id TEXT NOT NULL, \
avatar TEXT NOT NULL, \
client_id TEXT DEFAULT NULL, \
client_secret TEXT NOT NULL, \
access_token TEXT NOT NULL, \
refresh_token TEXT DEFAULT NULL, \
sort INTEGER UNIQUE NOT NULL)',
      err => {
        if (err) {
          console.error('failed to create accounts: ', err)
        }
      }
    )
    db.run(
      'CREATE TABLE IF NOT EXISTS servers(\
id INTEGER PRIMARY KEY, \
domain TEXT NOT NULL, \
base_url TEXT NOT NULL, \
sns TEXT NOT NULL, \
account_id INTEGER UNIQUE DEFAULT NULL, \
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE)',
      err => {
        if (err) {
          console.error('failed to create servers: ', err)
        }
      }
    )
    db.run(
      'CREATE TABLE IF NOT EXISTS hashtags(\
id INTEGER PRIMARY KEY, \
tag TEXT NOT NULL, \
account_id INTEGER UNIQUE NOT NULL, \
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE)',
      err => {
        if (err) {
          console.error('failed to create hashtags: ', err)
        }
      }
    )
  })

  return db
}

export default newDB
