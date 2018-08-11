import storage from 'electron-json-storage'
import objectAssignDeep from 'object-assign-deep'
import Visibility from '../constants/visibility'
import DisplayStyle from '../constants/displayStyle'

const Base = {
  general: {
    sound: {
      fav_rb: true,
      toot: true
    },
    theme: 'white',
    fontSize: 14,
    displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
    tootVisibility: Visibility.Public.value
  },
  state: {
    collapse: false
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
      return objectAssignDeep({}, Base, preferences)
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

  async update (obj) {
    const current = await this.load()
    const data = objectAssignDeep({}, current, obj)
    const result = await this.save(data)
    return result
  }
}
