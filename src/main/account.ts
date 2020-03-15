import { isEmpty } from 'lodash'
import generator, { detector, Entity, ProxyConfig } from 'megalodon'
import Datastore from 'nedb'
import log from 'electron-log'
import { LocalAccount } from '~/src/types/localAccount'

export default class Account {
  private db: Datastore

  constructor(db: Datastore) {
    this.db = db
  }

  async initialize() {
    await this.cleanup()
    await this.reorder()
    await this.updateUnique()
  }

  updateUnique(): Promise<{}> {
    return new Promise((resolve, reject) => {
      // At first, remove old index.
      this.db.removeIndex('order', err => {
        if (err) reject(err)
        // Add unique index.
        this.db.ensureIndex({ fieldName: 'order', unique: true, sparse: true }, err => {
          if (err) reject(err)
          resolve({})
        })
      })
    })
  }

  /**
   * Reorder accounts, because sometimes the order of accounts is duplicated.
   */
  async reorder() {
    const accounts = await this.listAllAccounts()
    await Promise.all(
      accounts.map(async (account, index) => {
        const update = await this.updateAccount(account._id!, Object.assign(account, { order: index + 1 }))
        return update
      })
    )
    const ordered = await this.listAllAccounts()
    return ordered
  }

  /**
   * Check order of all accounts, and fix if order is negative value or over the length.
   */
  async cleanup() {
    const accounts = await this.listAccounts()
    if (accounts.length < 1) {
      return accounts.length
    }
    if (accounts[0].order < 1 || accounts[accounts.length - 1].order > accounts.length) {
      await Promise.all(
        accounts.map(async (element, index) => {
          const update = await this.updateAccount(element._id!, Object.assign(element, { order: index + 1 }))
          return update
        })
      )
    }
    return null
  }

  insertAccount(localAccount: LocalAccount): Promise<LocalAccount> {
    return new Promise((resolve, reject) => {
      this.db.insert<LocalAccount>(localAccount, (err, doc) => {
        if (err) return reject(err)
        if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
        resolve(doc)
      })
    })
  }

  /**
   * List up all accounts either authenticated or not authenticated.
   */
  listAllAccounts(order = 1): Promise<Array<LocalAccount>> {
    return new Promise((resolve, reject) => {
      this.db
        .find<LocalAccount>({})
        .sort({ order: order })
        .exec((err, docs) => {
          if (err) return reject(err)
          if (isEmpty(docs)) return reject(new EmptyRecordError('empty'))
          resolve(docs)
        })
    })
  }

  /**
   * List up authenticated accounts.
   */
  listAccounts(): Promise<Array<LocalAccount>> {
    return new Promise((resolve, reject) => {
      this.db
        .find<LocalAccount>({ accessToken: { $ne: '' } })
        .sort({ order: 1 })
        .exec((err, docs) => {
          if (err) return reject(err)
          if (isEmpty(docs)) return reject(new EmptyRecordError('empty'))
          resolve(docs)
        })
    })
  }

  // Get the last account.
  async lastAccount(): Promise<LocalAccount> {
    const accounts = await this.listAllAccounts(-1)
    return accounts[0]
  }

  getAccount(id: string): Promise<LocalAccount> {
    return new Promise((resolve, reject) => {
      this.db.findOne<LocalAccount>(
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

  searchAccount(obj: any): Promise<LocalAccount> {
    return new Promise((resolve, reject) => {
      this.db.findOne<LocalAccount>(obj, (err, doc) => {
        if (err) return reject(err)
        if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
        resolve(doc)
      })
    })
  }

  searchAccounts(obj: any, order = 1): Promise<Array<LocalAccount>> {
    return new Promise((resolve, reject) => {
      this.db
        .find<LocalAccount>(obj)
        .sort({ order: order })
        .exec((err, docs) => {
          if (err) return reject(err)
          resolve(docs)
        })
    })
  }

  updateAccount(id: string, obj: any): Promise<LocalAccount> {
    return new Promise((resolve, reject) => {
      this.db.update(
        {
          _id: id
        },
        { $set: Object.assign(obj, { _id: id }) },
        { multi: true },
        (err, _numReplaced) => {
          if (err) return reject(err)
          this.db.findOne<LocalAccount>(
            {
              _id: id
            },
            (err, doc) => {
              if (err) return reject(err)
              if (isEmpty(doc)) return reject(new EmptyRecordError('empty'))
              resolve(doc)
            }
          )
        }
      )
    })
  }

  removeAccount(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.db.remove(
        {
          _id: id
        },
        { multi: true },
        (err, _numRemoved) => {
          if (err) return reject(err)
          resolve(id)
        }
      )
    })
  }

  removeAll(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) return reject(err)
        resolve(numRemoved)
      })
    })
  }

  async forwardAccount(ac: LocalAccount): Promise<LocalAccount | {}> {
    // Find account which is the previous of the target account.
    const accounts = await this.searchAccounts({ order: { $lt: ac.order } }, -1).catch(err => {
      console.log(err)
      return []
    })
    if (accounts.length < 1) {
      return Promise.resolve({})
    }
    const previousAccount = accounts[0]
    const targetOrder = ac.order
    const previousOrder = previousAccount.order

    // At first, we need to update the previous account with dummy order.
    // Because this column is uniqued, so can not update with same order.
    await this.updateAccount(
      previousAccount._id!,
      Object.assign(previousAccount, {
        order: -1
      })
    )
    // Change order of the target account.
    const updated = await this.updateAccount(
      ac._id!,
      Object.assign(ac, {
        order: previousOrder
      })
    )
    // Update the previous account with right order.
    await this.updateAccount(
      previousAccount._id!,
      Object.assign(previousAccount, {
        order: targetOrder
      })
    )
    return updated
  }

  async backwardAccount(ac: LocalAccount): Promise<LocalAccount | {}> {
    // Find account which is the next of the target account.
    const accounts = await this.searchAccounts({ order: { $gt: ac.order } }, 1).catch(err => {
      console.log(err)
      return []
    })
    if (accounts.length < 1) {
      return Promise.resolve({})
    }
    const nextAccount = accounts[0]
    const targetOrder = ac.order
    const nextOrder = nextAccount.order

    // At first, we need to update the next account with dummy order.
    // Because this colum is uniqued, so can not update with same order.
    await this.updateAccount(
      nextAccount._id!,
      Object.assign(nextAccount, {
        order: -1
      })
    )
    // Change order of the target account/
    const updated = await this.updateAccount(
      ac._id!,
      Object.assign(ac, {
        order: nextOrder
      })
    )
    // Update the next account with right order.
    await this.updateAccount(
      nextAccount._id!,
      Object.assign(nextAccount, {
        order: targetOrder
      })
    )
    return updated
  }

  async refreshAccounts(proxy: ProxyConfig | false): Promise<Array<LocalAccount>> {
    const accounts = await this.listAccounts()
    if (accounts.length < 1) {
      return accounts
    }
    const results = await Promise.all(
      accounts.map(async account => {
        const refresh = await this.refresh(account, proxy)
        return refresh
      })
    )
    return results
  }

  /**
   * refresh: Refresh an account which is already saved at local
   * @param {LocalAccount} account is an local account
   * @return {LocalAccount} updated account
   */
  async refresh(account: LocalAccount, proxy: ProxyConfig | false): Promise<LocalAccount> {
    const sns = await detector(account.baseURL, proxy)
    let client = generator(sns, account.baseURL, account.accessToken, 'Whalebird', proxy)
    let json = {}
    try {
      const res = await client.verifyAccountCredentials()
      json = {
        username: res.data.username,
        accountId: res.data.id,
        avatar: res.data.avatar
      }
    } catch (err) {
      log.error(err)
      log.info('Get new access token using refresh token...')
      // If failed to fetch account, get new access token usign refresh token.
      if (!account.refreshToken) {
        throw new RefreshTokenDoesNotExist()
      }
      const token = await client.refreshToken(account.clientId, account.clientSecret, account.refreshToken)
      client = generator(sns, account.baseURL, token.access_token, 'Whalebird', proxy)
      const res = await client.verifyAccountCredentials()
      json = {
        username: res.data.username,
        accountId: res.data.id,
        avatar: res.data.avatar,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken
      }
    }
    return this.updateAccount(account._id!, json)
  }

  // Confirm the access token, and check duplicate
  async fetchAccount(
    sns: 'mastodon' | 'pleroma' | 'misskey',
    account: LocalAccount,
    accessToken: string,
    proxy: ProxyConfig | false
  ): Promise<Entity.Account> {
    const client = generator(sns, account.baseURL, accessToken, 'Whalebird', proxy)
    const res = await client.verifyAccountCredentials()
    const query = {
      baseURL: account.baseURL,
      username: res.data.username
    }
    const duplicates = await this.searchAccounts(query)
    if (duplicates.length > 0) {
      throw new DuplicateRecordError(`${res.data.username}@${account.baseURL} is duplicated`)
    }
    return res.data
  }
}

class EmptyRecordError extends Error {}

class DuplicateRecordError extends Error {}

class RefreshTokenDoesNotExist extends Error {}
