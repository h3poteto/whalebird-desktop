import { Database } from 'better-sqlite3'
import { Setting } from '~/src/types/setting'
import { DefaultSetting } from '~/src/constants/initializer/setting'

export const getSetting = (db: Database, accountId: number): Promise<Setting> => {
  return new Promise(resolve => {
    const row = db.prepare('SELECT * FROM settings WHERE account_id = ?').get(accountId)
    if (row) {
      return resolve({
        accountId: row.account_id,
        markerHome: Boolean(row.marker_home),
        markerNotifications: Boolean(row.marker_notifications)
      })
    }
    resolve(DefaultSetting)
  })
}

export const createOrUpdateSetting = (db: Database, setting: Setting): Promise<Setting> => {
  return new Promise((resolve, reject) => {
    const row = db.prepare('SELECT * FROM settings WHERE account_id = ?').get(setting.accountId)
    if (row) {
      try {
        db.prepare('UPDATE settings SET marker_home = ?, marker_notifications = ? WHERE account_id = ?').run(
          setting.markerHome,
          setting.markerNotifications,
          setting.accountId
        )
        resolve(setting)
      } catch (err) {
        console.error(err)
        reject(err)
      }
    } else {
      try {
        db.prepare('INSERT INTO settings(account_id, marker_home, marker_notifications) VALUES (?, ?, ?)').run(
          setting.accountId,
          setting.markerHome,
          setting.markerNotifications
        )
        resolve(setting)
      } catch (err) {
        console.error(err)
        reject(err)
      }
    }
  })
}
