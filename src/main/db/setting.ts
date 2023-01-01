import sqlite3 from 'sqlite3'
import { Setting } from '~/src/types/setting'
import { DefaultSetting } from '~/src/constants/initializer/setting'

export const getSetting = (db: sqlite3.Database, accountId: number): Promise<Setting> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM settings WHERE account_id = ?', accountId, (err, row) => {
      if (err) {
        reject(err)
      }
      if (row) {
        resolve({
          accountId: row.account_id,
          markerHome: Boolean(row.marker_home),
          markerNotifications: Boolean(row.marker_notifications)
        })
      }
      resolve(DefaultSetting)
    })
  })
}

export const createOrUpdateSetting = (db: sqlite3.Database, setting: Setting): Promise<Setting> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM settings WHERE account_id = ?', setting.accountId, (err, row) => {
      if (err) {
        reject(err)
      }
      if (row) {
        db.run(
          'UPDATE settings SET marker_home = ?, marker_notifications = ? WHERE account_id = ?',
          [setting.markerHome, setting.markerNotifications, setting.accountId],
          err => {
            if (err) {
              reject(err)
            }
            resolve(setting)
          }
        )
        resolve(setting)
      } else {
        db.run(
          'INSERT INTO settings(account_id, marker_home, marker_notifications) VALUES (?, ?, ?)',
          [setting.accountId, setting.markerHome, setting.markerNotifications],
          function (err) {
            if (err) {
              reject(err)
            }
            resolve(setting)
          }
        )
      }
    })
  })
}
