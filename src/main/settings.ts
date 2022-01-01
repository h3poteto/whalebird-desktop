import storage from 'electron-json-storage'
import log from 'electron-log'
import objectAssignDeep from 'object-assign-deep'
import { BaseSettings, Setting } from '~/src/types/setting'
import { Base } from '~/src/constants/initializer/setting'
import { isEmpty } from 'lodash'

export default class Settings {
  private path: string

  constructor(path: string) {
    this.path = path
  }

  public async load(): Promise<BaseSettings> {
    try {
      const settings = await this._get()
      if (isEmpty(settings)) {
        return []
      }
      return settings
    } catch (err) {
      log.error(err)
      return []
    }
  }

  public async get(accountID: string): Promise<Setting> {
    const current = await this.load()
    const find: Setting | undefined = current.find(d => {
      return d.accountID === accountID
    })
    if (find) {
      return find
    }
    const base = objectAssignDeep({}, Base, {
      accountID: accountID
    })
    return base
  }

  private _get(): Promise<BaseSettings> {
    return new Promise((resolve, reject) => {
      storage.get(this.path, (err, data) => {
        if (err) return reject(err)
        return resolve(data as BaseSettings)
      })
    })
  }

  private _save(data: BaseSettings): Promise<BaseSettings> {
    return new Promise((resolve, reject) => {
      storage.set(this.path, data, err => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }

  public async update(obj: Setting): Promise<BaseSettings> {
    const current = await this.load()
    const find = current.find(d => {
      return d.accountID === obj.accountID
    })
    if (find) {
      const data = current.map(d => {
        if (d.accountID !== obj.accountID) {
          return d
        }
        const newData = objectAssignDeep({}, d, obj)
        return newData
      })
      const result = await this._save(data)
      return result
    } else {
      const data = current.concat([obj])
      const result = await this._save(data)
      return result
    }
  }
}
