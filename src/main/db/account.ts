import sqlite3 from 'sqlite3'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~src/types/localServer'

export const insertAccount = (
  db: sqlite3.Database,
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
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')

      db.get('SELECT * FROM accounts ORDER BY sort DESC', (err, row) => {
        if (err) {
          reject(err)
        }
        let order = 1
        if (row) {
          order = row.sort + 1
        }
        db.run(
          'INSERT INTO accounts(username, account_id, avatar, client_id, client_secret, access_token, refresh_token, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [username, accountId, avatar, clientId, clientSecret, accessToken, refreshToken, order],
          function (err) {
            if (err) {
              reject(err)
            }
            const id = this.lastID

            db.run('UPDATE servers SET account_id = ? WHERE id = ?', [id, serverId], err => {
              if (err) {
                reject(err)
              }

              db.run('COMMIT')
              resolve({
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
            })
          }
        )
      })
    })
  })
}

/**
 * List up authenticated accounts.
 */
export const listAccounts = (db: sqlite3.Database): Promise<Array<[LocalAccount, LocalServer]>> => {
  return new Promise((resolve, reject) => {
    db.all(
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
FROM accounts INNER JOIN servers ON servers.account_id = accounts.id ORDER BY accounts.sort',
      (err, rows) => {
        if (err) {
          reject(err)
        }
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
      }
    )
  })
}

export const getAccount = (db: sqlite3.Database, id: number): Promise<[LocalAccount, LocalServer]> => {
  return new Promise((resolve, reject) => {
    db.get(
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
FROM accounts INNER JOIN servers ON servers.account_id = accounts.id WHERE accounts.id = ?',
      id,
      (err, r) => {
        if (err) {
          reject(err)
        }
        resolve([
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
      }
    )
  })
}

export const removeAccount = (db: sqlite3.Database, id: number): Promise<null> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON')

      db.run('DELETE FROM accounts WHERE id = ?', id, err => {
        if (err) {
          reject(err)
        }
        resolve(null)
      })
    })
  })
}

export const removeAllAccounts = (db: sqlite3.Database): Promise<null> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON')

      db.run('DELETE FROM accounts', err => {
        if (err) {
          reject(err)
        }
        resolve(null)
      })
    })
  })
}

export const forwardAccount = (db: sqlite3.Database, id: number): Promise<null> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')

      db.all('SELECT * FROM accounts ORDER BY sort', (err, rows) => {
        if (err) {
          console.error(err)
          db.run('ROLLBACK TRANSACTION')
          return reject(err)
        }

        const index = rows.findIndex(r => r.id === id)
        if (index < 0 || index >= rows.length - 1) {
          db.run('ROLLBACK TRANSACTION')
          return resolve(null)
        }
        const target = rows[index + 1]
        const base = rows[index]

        db.serialize(() => {
          db.run('UPDATE accounts SET sort = ? WHERE id = ?', [-100, base.id], err => {
            if (err) {
              console.error(err)
              db.run('ROLLBACK TRANSACTION')
              return reject(err)
            }
          })
          db.run('UPDATE accounts SET sort = ? WHERE id = ?', [base.sort, target.id], err => {
            if (err) {
              console.error(err)
              db.run('ROLLBACK TRANSACTION')
              return reject(err)
            }
          })
          db.run('UPDATE accounts SET sort = ? WHERE id = ?', [target.sort, base.id], err => {
            if (err) {
              console.error(err)
              db.run('ROLLBACK TRANSACTION')
              return reject(err)
            }
            db.run('COMMIT')
            return resolve(null)
          })
        })
      })
    })
  })
}

export const backwardAccount = (db: sqlite3.Database, id: number): Promise<null> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')

      db.all('SELECT * FROM accounts ORDER BY sort', (err, rows) => {
        if (err) {
          console.error(err)
          db.run('ROLLBACK TRANSACTION')
          return reject(err)
        }

        const index = rows.findIndex(r => r.id === id)
        if (index < 1) {
          db.run('ROLLBACK TRANSACTION')
          return resolve(null)
        }
        const target = rows[index - 1]
        const base = rows[index]

        db.serialize(() => {
          db.run('UPDATE accounts SET sort = ? WHERE id = ?', [-100, base.id], err => {
            if (err) {
              console.error(err)
              db.run('ROLLBACK TRANSACTION')
              return reject(err)
            }
          })
          db.run('UPDATE accounts SET sort = ? WHERE id = ?', [base.sort, target.id], err => {
            if (err) {
              console.error(err)
              db.run('ROLLBACK TRANSACTION')
              return reject(err)
            }
          })
          db.run('UPDATE accounts SET sort = ? WHERE id = ?', [target.sort, base.id], err => {
            if (err) {
              console.error(err)
              db.run('ROLLBACK TRANSACTION')
              return reject(err)
            }
            db.run('COMMIT')
            return resolve(null)
          })
        })
      })
    })
  })
}
