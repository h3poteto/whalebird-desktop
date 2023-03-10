import { Database } from 'better-sqlite3'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~src/types/localServer'

export const insertAccount = (
  db: Database,
  username: string,
  accountId: string,
  avatar: string,
  clientId: string,
  clientSecret: string,
  accessToken: string,
  refreshToken: string | null,
  serverId: number
): Promise<LocalAccount> => {
  return new Promise((resolve, reject) => {
    const f = db.transaction(() => {
      const row = db.prepare('SELECT * FROM accounts ORDER BY sort DESC').get()
      let order = 1
      if (row) {
        order = row.sort + 1
      }
      try {
        const res = db
          .prepare(
            'INSERT INTO accounts(username, account_id, avatar, client_id, client_secret, access_token, refresh_token, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          )
          .run(username, accountId, avatar, clientId, clientSecret, accessToken, refreshToken, order)
        const id = res.lastInsertRowid as number
        db.prepare('UPDATE servers SET account_id = ? WHERE id = ?').run(id, serverId)
        return resolve({
          id,
          username,
          accountId,
          avatar,
          clientId,
          clientSecret,
          accessToken,
          refreshToken,
          order
        })
      } catch (err) {
        reject(err)
      }
    })
    f()
  })
}

/**
 * List up authenticated accounts.
 */
export const listAccounts = (db: Database): Promise<Array<[LocalAccount, LocalServer]>> => {
  return new Promise(resolve => {
    const rows = db
      .prepare(
        'SELECT \
accounts.id as id, \
accounts.username as username, \
accounts.account_id as remote_account_id, \
accounts.avatar as avatar, \
accounts.client_id as client_id, \
accounts.client_secret as client_secret, \
accounts.access_token as access_token, \
accounts.refresh_token as refresh_token, \
accounts.sort as sort, \
servers.id as server_id, \
servers.base_url as base_url, \
servers.domain as domain, \
servers.sns as sns, \
servers.account_id as account_id \
FROM accounts INNER JOIN servers ON servers.account_id = accounts.id ORDER BY accounts.sort'
      )
      .all()

    resolve(
      rows.map(r => [
        {
          id: r.id,
          username: r.username,
          accountId: r.remote_account_id,
          avatar: r.avatar,
          clientId: r.client_id,
          clientSecret: r.client_secret,
          accessToken: r.access_token,
          refreshToken: r.refresh_token,
          order: r.sort
        } as LocalAccount,
        {
          id: r.server_id,
          baseURL: r.base_url,
          domain: r.domain,
          sns: r.sns,
          accountId: r.account_id
        } as LocalServer
      ])
    )
  })
}

export const getAccount = (db: Database, id: number): Promise<[LocalAccount, LocalServer]> => {
  return new Promise((resolve, reject) => {
    const row = db
      .prepare(
        'SELECT \
accounts.id as id, \
accounts.username as username, \
accounts.account_id as remote_account_id, \
accounts.avatar as avatar, \
accounts.client_id as client_id, \
accounts.client_secret as client_secret, \
accounts.access_token as access_token, \
accounts.refresh_token as refresh_token, \
accounts.sort as sort, \
servers.id as server_id, \
servers.base_url as base_url, \
servers.domain as domain, \
servers.sns as sns, \
servers.account_id as account_id \
FROM accounts INNER JOIN servers ON servers.account_id = accounts.id WHERE accounts.id = ?'
      )
      .get(id)
    if (row) {
      resolve([
        {
          id: row.id,
          username: row.username,
          accountId: row.remote_account_id,
          avatar: row.avatar,
          clientId: row.client_id,
          clientSecret: row.client_secret,
          accessToken: row.access_token,
          refreshToken: row.refresh_token,
          order: row.sort
        } as LocalAccount,
        {
          id: row.server_id,
          baseURL: row.base_url,
          domain: row.domain,
          sns: row.sns,
          accountId: row.account_id
        } as LocalServer
      ])
    } else {
      reject()
    }
  })
}

export const removeAccount = (db: Database, id: number): Promise<null> => {
  return new Promise((resolve, reject) => {
    db.prepare('PRAGMA foreign_keys = ON').run()

    try {
      db.prepare('DELETE FROM accounts WHERE id = ?').run(id), resolve(null)
    } catch (err) {
      reject(err)
    }
  })
}

export const removeAllAccounts = (db: Database): Promise<null> => {
  return new Promise((resolve, reject) => {
    db.prepare('PRAGMA foreign_keys = ON').run()

    try {
      db.prepare('DELETE FROM accounts').run()
      resolve(null)
    } catch (err) {
      reject(err)
    }
  })
}

export const forwardAccount = (db: Database, id: number): Promise<null> => {
  return new Promise((resolve, reject) => {
    const f = db.transaction(() => {
      const rows = db.prepare('SELECT * FROM accounts ORDER BY sort').all()

      const index = rows.findIndex(r => r.id === id)
      if (index < 0 || index >= rows.length - 1) {
        db.prepare('ROLLBACK TRANSACTION').run()
        return resolve(null)
      }
      const target = rows[index + 1]
      const base = rows[index]

      try {
        db.prepare('UPDATE accounts SET sort = ? WHERE id = ?').run(-100, base.id)
        db.prepare('UPDATE accounts SET sort = ? WHERE id = ?').run(base.sort, target.id)
        db.prepare('UPDATE accounts SET sort = ? WHERE id = ?').run(target.sort, base.id)
        return resolve(null)
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
    f()
  })
}

export const backwardAccount = (db: Database, id: number): Promise<null> => {
  return new Promise((resolve, reject) => {
    const f = db.transaction(() => {
      const rows = db.prepare('SELECT * FROM accounts ORDER BY sort').all()

      const index = rows.findIndex(r => r.id === id)
      if (index < 1) {
        db.prepare('ROLLBACK TRANSACTION').run()
        return resolve(null)
      }
      const target = rows[index - 1]
      const base = rows[index]

      try {
        db.prepare('UPDATE accounts SET sort = ? WHERE id = ?').run(-100, base.id)
        db.prepare('UPDATE accounts SET sort = ? WHERE id = ?').run(base.sort, target.id)
        db.prepare('UPDATE accounts SET sort = ? WHERE id = ?').run(target.sort, base.id)
        return resolve(null)
      } catch (err) {
        console.error(err)
        return reject(err)
      }
    })
    f()
  })
}
