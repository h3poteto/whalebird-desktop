import storage from 'electron-json-storage'
import log from 'electron-log'
import objectAssignDeep from 'object-assign-deep'
import { BaseConfig } from '~/src/types/preference'
import { Base } from '~/src/constants/initializer/preferences'

export default class Preferences {
  private path: string

  constructor(path: string) {
    this.path = path
  }

  public async load(): Promise<BaseConfig> {
    try {
      const preferences = await this._get()
      return objectAssignDeep({}, Base, preferences)
    } catch (err) {
      log.error(err)
      return Base
    }
  }

  private _get(): Promise<BaseConfig> {
    return new Promise((resolve, reject) => {
      storage.get(this.path, (err, data) => {
        if (err) return reject(err)
        return resolve(data as BaseConfig)
      })
    })
  }

  private _save(data: BaseConfig): Promise<BaseConfig> {
    return new Promise((resolve, reject) => {
      storage.set(this.path, data, err => {
        if (err) return reject(err)
        return resolve(data)
      })
    })
  }

  public async update(obj: any): Promise<BaseConfig> {
    const current = await this.load()
    const data = objectAssignDeep({}, current, obj)
    const result = await this._save(data)
    return result
  }

  public async reset(): Promise<BaseConfig> {
    return this.update(Base)
  }
}
