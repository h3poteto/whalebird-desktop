import empty from 'is-empty'
import Mastodon from 'megalodon'

export default class Account {
  constructor (db) {
    this.db = db
  }

  insertAccount (obj) {
    return new Promise((resolve, reject) => {
      this.db.insert(obj, (err, doc) => {
        if (err) return reject(err)
        if (empty(doc)) return reject(new EmptyRecordError('empty'))
        resolve(doc)
      })
    })
  }

  listAccounts () {
    return new Promise((resolve, reject) => {
      this.db.find({accessToken: { $ne: '' }}).sort({ order: 1 }).exec((err, docs) => {
        if (err) return reject(err)
        if (empty(docs)) return reject(new EmptyRecordError('empty'))
        resolve(docs)
      })
    })
  }

  countAuthorizedAccounts () {
    return new Promise((resolve, reject) => {
      this.db.count({accessToken: { $ne: '' }}, (err, count) => {
        if (err) return reject(err)
        resolve(count)
      })
    })
  }

  getAccount (id) {
    return new Promise((resolve, reject) => {
      this.db.findOne(
        {
          _id: id
        },
        (err, doc) => {
          if (err) return reject(err)
          if (empty(doc)) return reject(new EmptyRecordError('empty'))
          resolve(doc)
        }
      )
    })
  }

  searchAccount (obj) {
    return new Promise((resolve, reject) => {
      this.db.findOne(
        obj,
        (err, doc) => {
          if (err) return reject(err)
          if (empty(doc)) return reject(new EmptyRecordError('empty'))
          resolve(doc)
        })
    })
  }

  updateAccount (id, obj) {
    return new Promise((resolve, reject) => {
      this.db.update(
        {
          _id: id
        },
        { $set: Object.assign(obj, { _id: id }) },
        { multi: true },
        (err, numReplaced) => {
          if (err) return reject(err)
          this.db.findOne(
            {
              _id: id
            },
            (err, doc) => {
              if (err) return reject(err)
              if (empty(doc)) return reject(new EmptyRecordError('empty'))
              resolve(doc)
            })
        }
      )
    })
  }

  removeAccount (id) {
    return new Promise((resolve, reject) => {
      this.db.remove(
        {
          _id: id
        },
        { multi: true },
        (err, numRemoved) => {
          if (err) return reject(err)
          resolve(numRemoved)
        }
      )
    })
  }

  async forwardAccount (ac) {
    if (ac.order <= 1) {
      return ac.order
    }
    // Find account which is backwarded
    const backwarded = await this.searchAccount(
      {
        order: ac.order - 1
      }
    )
    await this.updateAccount(backwarded._id, Object.assign(backwarded, { order: (backwarded.order + 1) }))
    // Forward account order
    const updated = await this.updateAccount(ac._id, Object.assign(ac, { order: (ac.order - 1) }))
    return updated
  }

  async backwardAccount (ac) {
    const length = await this.countAuthorizedAccounts()
    if (ac.order >= length) {
      return ac.order
    }
    // Find account which is forwarded
    const forwarded = await this.searchAccount(
      {
        order: ac.order + 1
      }
    )
    await this.updateAccount(forwarded._id, Object.assign(forwarded, { order: (forwarded.order - 1) }))
    // Backward account order
    const updated = await this.updateAccount(ac._id, Object.assign(ac, { order: (ac.order + 1) }))
    return updated
  }

  /*
   * cleanup
   * Check order of all accounts, and fix if order is negative value or over the length.
   */
  async cleanup () {
    const accounts = await this.listAccounts()
    if (accounts.length < 1) {
      return accounts.length
    }
    if (accounts[0].order < 1 || accounts[accounts.length - 1].order > accounts.length) {
      await Promise.all(accounts.map(async (element, index) => {
        const update = await this.updateAccount(element._id, Object.assign(element, { order: index + 1 }))
        return update
      }))
    }
    return null
  }

  async refreshAccounts () {
    const accounts = await this.listAccounts()
    if (accounts.length < 1) {
      return accounts.length
    }
    const results = await Promise.all(accounts.map(async (account) => {
      const refresh = await this.refresh(account)
      return refresh
    }))
    return results
  }

  refresh (account) {
    const client = new Mastodon(
      account.accessToken,
      account.baseURL + '/api/v1'
    )
    return client.get('/accounts/verify_credentials')
      .then(data => {
        const json = {
          username: data.username,
          accountId: data.id,
          avatar: data.avatar
        }
        return this.updateAccount(account._id, json)
      })
  }
}

class EmptyRecordError {
  constructor (message) {
    this.message = message
  }
}
