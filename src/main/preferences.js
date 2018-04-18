import empty from 'is-empty'
import storage from 'electron-json-storage'

const Base = {
  general: {
    sound: {
      fav_rb: true,
      toot: true
    },
    theme: 'white',
    displayName: 0
  }
}

export default class Preferences {
  constructor (path) {
    this.path = path
    this.data = Base
  }

  async load () {
    try {
      const preferences = await this.get()
      if (empty(preferences)) return Base
      return preferences
    } catch (err) {
      return Base
    }
  }

  get () {
    return new Promise((resolve, reject) => {
      storage.get(this.path, (err, data) => {
        if (err) return reject(err)
        this.data = data
        return resolve(data)
      })
    })
  }

  save (data) {
    return new Promise((resolve, reject) => {
      storage.set(this.path, data, (err) => {
        if (err) return reject(err)
        this.data = data
        return resolve(data)
      })
    })
  }
}
