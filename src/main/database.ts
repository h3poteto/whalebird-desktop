import sqlite, { Database } from 'better-sqlite3'

const newDB = (file: string): Database => {
  const db = new sqlite(file)

  // migration
  db.prepare(
    'CREATE TABLE IF NOT EXISTS accounts(\
id INTEGER PRIMARY KEY, \
username TEXT NOT NULL, \
account_id TEXT NOT NULL, \
avatar TEXT NOT NULL, \
client_id TEXT DEFAULT NULL, \
client_secret TEXT NOT NULL, \
access_token TEXT NOT NULL, \
refresh_token TEXT DEFAULT NULL, \
sort INTEGER UNIQUE NOT NULL)'
  ).run()

  db.prepare(
    'CREATE TABLE IF NOT EXISTS servers(\
id INTEGER PRIMARY KEY, \
domain TEXT NOT NULL, \
base_url TEXT NOT NULL, \
sns TEXT NOT NULL, \
account_id INTEGER UNIQUE DEFAULT NULL, \
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE)'
  ).run()
  db.prepare(
    'CREATE TABLE IF NOT EXISTS hashtags(\
id INTEGER PRIMARY KEY, \
tag TEXT NOT NULL, \
account_id INTEGER UNIQUE NOT NULL, \
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE)'
  ).run()
  db.prepare(
    'CREATE TABLE IF NOT EXISTS settings(\
id INTEGER PRIMARY KEY, \
account_id INTEGER UNIQUE NOT NULL, \
marker_home BOOLEAN NOT NULL DEFAULT false, \
marker_notifications BOOLEAN NOT NULL DEFAULT true, \
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE)'
  ).run()
  db.prepare(
    "DELETE FROM accounts WHERE id IN (SELECT accounts.id FROM accounts INNER JOIN servers ON servers.account_id = accounts.id WHERE servers.sns = 'misskey')"
  ).run()

  return db
}

export default newDB
