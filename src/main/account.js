import { isEmpty } from 'lodash'
import Mastodon from 'megalodon'

export default class Account {
  constructor (db) {
    this.db = db
  }

  async initialize () {
    await this.cleanup()
    await this.reorder()
    await this.updateUnique()
  }

  updateUnique () {
    return new Promise((resolve, reject) => {
      // At first, remove old index.
      this.db.removeIndex('order', (err) => {
        if (err) reject(err)
        // Add unique index.
        this.db.ensureIndex({ fieldName: 'order', unique: true, sparse: true }, (err) => {
          if (err) reject(err)
          resolve(null)
        })
      })
    })
  }

  /**
   * Reorder accounts, because sometimes the order of accounts is duplicated.
   */
  async reorder () {
    const accounts = await this.listAllAccounts()
    await Promise.all(accounts.map(async (account, index) => {
      const update = await this.updateAccount(account._id, Object.assign(account, { order: index + 1 }))
      return update
    }))
    const ordered = await this.listAllAccounts()
    return ordered
  }

  /**
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

  insertAccount (obj) {
    return new Promise((resolve, reject) => {
      this.db.insert(obj, (err, doc) => {
        if (err) return reject(err)
        if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
        resolve(doc)
      })
    })
  }

  /**
   * List up all accounts either authenticated or not authenticated.
   */
  listAllAccounts (order = 1) {
    return new Promise((resolve, reject) => {
      this.db.find().sort({ order: order }).exec((err, docs) => {
        if (err) return reject(err)
        if (isEmpty(docs)) return reject(new EmptyRecordError('empty'))
        resolve(docs)
      })
    })
  }

  /**
   * List up authenticated accounts.
   */
  listAccounts () {
    return new Promise((resolve, reject) => {
      this.db.find({ accessToken: { $ne: '' } }).sort({ order: 1 }).exec((err, docs) => {
        if (err) return reject(err)
        if (isEmpty(docs)) return reject(new EmptyRecordError('empty'))
        resolve(docs)
      })
    })
  }

  // Get the last account.
  async lastAccount () {
    const accounts = await this.listAllAccounts(-1)
    return accounts[0]
  }

  getAccount (id) {
    return new Promise((resolve, reject) => {
      this.db.findOne(
        {
          _id: id
        },
        (err, doc) => {
          if (err) return reject(err)
          if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
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
          if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
          resolve(doc)
        })
    })
  }

  searchAccounts (obj, order = 1) {
    return new Promise((resolve, reject) => {
      this.db.find(obj).sort({ order: order }).exec((err, docs) => {
        if (err) return reject(err)
        resolve(docs)
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
        (err, _numReplaced) => {
          if (err) return reject(err)
          this.db.findOne(
            {
              _id: id
            },
            (err, doc) => {
              if (err) return reject(err)
              if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
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

  removeAll () {
    return new Promise((resolve, reject) => {
      this.db.remove(
        {},
        { multi: true },
        (err, numRemoved) => {
          if (err) return reject(err)
          resolve(numRemoved)
        }
      )
    })
  }

  async forwardAccount (ac) {
    // Find account which is the previous of the target account.
    const accounts = await this.searchAccounts({ order: { $lt: ac.order } }, -1)
      .catch((err) => {
        console.log(err)
        return []
      })
    if (accounts.length < 1) {
      return null
    }
    const previousAccount = accounts[0]
    const targetOrder = ac.order
    const previousOrder = previousAccount.order

    // At first, we need to update the previous account with dummy order.
    // Because this column is uniqued, so can not update with same order.
    await this.updateAccount(previousAccount._id, Object.assign(
      previousAccount,
      {
        order: -1
      }
    ))
    // Change order of the target account.
    const updated = await this.updateAccount(ac._id, Object.assign(
      ac,
      {
        order: previousOrder
      }
    ))
    // Update the previous account with right order.
    await this.updateAccount(previousAccount._id, Object.assign(
      previousAccount,
      {
        order: targetOrder
      }
    ))
    return updated
  }

  async backwardAccount (ac) {
    // Find account which is the next of the target account.
    const accounts = await this.searchAccounts({ order: { $gt: ac.order } }, 1)
      .catch((err) => {
        console.log(err)
        return []
      })
    if (accounts.length < 1) {
      return null
    }
    const nextAccount = accounts[0]
    const targetOrder = ac.order
    const nextOrder = nextAccount.order

    // At first, we need to update the next account with dummy order.
    // Because this colum is uniqued, so can not update with same order.
    await this.updateAccount(nextAccount._id, Object.assign(
      nextAccount,
      {
        order: -1
      }
    ))
    // Change order of the target account/
    const updated = await this.updateAccount(ac._id, Object.assign(
      ac,
      {
        order: nextOrder
      }
    ))
    // Update the next account with right order.
    await this.updateAccount(nextAccount._id, Object.assign(
      nextAccount,
      {
        order: targetOrder
      }
    ))
    return updated
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
      .then(res => {
        const json = {
          username: res.data.username,
          accountId: res.data.id,
          avatar: res.data.avatar
        }
        return this.updateAccount(account._id, json)
      })
  }

  // Confirm the access token, and check duplicate
  async fetchAccount (account, accessToken) {
    const client = new Mastodon(
      accessToken,
      account.baseURL + '/api/v1'
    )
    const data = await client.get('/accounts/verify_credentials')
    const query = {
      baseURL: account.baseURL,
      username: data.username
    }
    const duplicates = await this.searchAccounts(query)
    if (duplicates.length > 0) {
      throw new DuplicateRecordError(`${data.username}@${account.baseURL} is duplicated`)
    }
    return data
  }
}

class EmptyRecordError extends Error {
  constructor (msg) {
    super(msg)
    this.name = 'EmptyRecordError'
  }
}

class DuplicateRecordError extends Error {
  constructor (msg) {
    super(msg)
    this.name = 'DuplicateRecordError'
  }
}
