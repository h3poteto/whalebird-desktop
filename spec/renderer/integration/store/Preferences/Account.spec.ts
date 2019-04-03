import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import { ipcMain } from '~/spec/mock/electron'
import Account from '@/store/Preferences/Account'

const state = () => {
  return {
    accounts: [],
    accountLoading: false
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Account.actions,
    mutations: Account.mutations
  }
}

describe('Account', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Account: initStore()
      }
    })
  })

  describe('loadAccounts', () => {
    it('error', async () => {
      ipcMain.once('list-accounts', (event, _) => {
        event.sender.send('error-list-accounts', new Error())
      })

      await store.dispatch('Account/loadAccounts')
        .catch((err: Error) => {
          expect(err instanceof Error).toEqual(true)
        })
    })
    it('success', async () => {
      ipcMain.once('list-accounts', (event, _) => {
        event.sender.send('response-list-accounts', ['accounts'])
      })
      await store.dispatch('Account/loadAccounts')
      expect(store.state.Account.accounts).toEqual(['accounts'])
    })
  })

  describe('removeAccount', () => {
    it('error', async () => {
      ipcMain.once('remove-account', (event, _) => {
        event.sender.send('error-remove-account', new Error())
      })
      await store.dispatch('Account/removeAccount', 'account')
        .catch((err: Error) => {
          expect(err instanceof Error).toEqual(true)
        })
    })
    it('success', async () => {
      ipcMain.once('remove-account', (event, _) => {
        event.sender.send('response-remove-account', 1)
      })
      const res = await store.dispatch('Account/removeAccount', 'account')
      expect(res).toEqual(undefined)
    })
  })

  describe('forwardAccount', () => {
    it('error', async () => {
      ipcMain.once('forward-account', (event, _) => {
        event.sender.send('error-forward-account', new Error())
      })
      await store.dispatch('Account/forwardAccount', 'account')
        .catch((err: Error) => {
          expect(err instanceof Error).toEqual(true)
        })
    })
    it('success', async () => {
      ipcMain.once('forward-account', (event, _) => {
        event.sender.send('response-forward-account', 1)
      })
      const res = await store.dispatch('Account/forwardAccount', 'account')
      expect(res).toEqual(undefined)
    })
  })

  describe('backwardAccount', () => {
    it('error', async () => {
      ipcMain.once('backward-account', (event, _) => {
        event.sender.send('error-backward-account', new Error())
      })
      await store.dispatch('Account/backwardAccount', 'account')
        .catch((err: Error) => {
          expect(err instanceof Error).toEqual(true)
        })
    })
    it('success', async () => {
      ipcMain.once('backward-account', (event, _) => {
        event.sender.send('response-backward-account', 1)
      })
      const res = await store.dispatch('Account/backwardAccount', 'account')
      expect(res).toEqual(undefined)
    })
  })

  describe('removeAllAccounts', () => {
    it('error', async () => {
      ipcMain.once('remove-all-accounts', (event, _) => {
        event.sender.send('error-remove-all-accounts', new Error())
      })
      await store.dispatch('Account/removeAllAccounts', 'account')
        .catch((err: Error) => {
          expect(err instanceof Error).toEqual(true)
        })
    })
    it('success', async () => {
      ipcMain.once('remove-all-accounts', (event, _) => {
        event.sender.send('response-remove-all-accounts', 1)
      })
      const res = await store.dispatch('Account/removeAllAccounts', 'account')
      expect(res).toEqual(undefined)
    })
  })
})
