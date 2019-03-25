import Account from '@/store/Preferences/Account'
import { ipcMain } from '~/spec/mock/electron'

describe('Preferences/Account', () => {
  describe('mutations', () => {
    let state
    beforeEach(() => {
      state = {
        accounts: [],
        accountLoading: false
      }
    })
    describe('updateAccounts', () => {
      it('should be updated', () => {
        Account.mutations.updateAccounts(state, ['account'])
        expect(state.accounts).toEqual(['account'])
      })
    })
    describe('updateAccountLoading', () => {
      it('should be update', () => {
        Account.mutations.updateAccountLoading(state, true)
        expect(state.accountLoading).toEqual(true)
      })
    })
  })

  describe('actions', () => {
    describe('loadAccounts', () => {
      it('error', async () => {
        ipcMain.once('list-accounts', (event, _) => {
          event.sender.send('error-list-accounts', new LoadAccountsError())
        })
        const commitMock = jest.fn()
        await Account.actions.loadAccounts({ commit: commitMock })
          .catch((err) => {
            expect(err instanceof LoadAccountsError).toEqual(true)
          })
      })
      it('success', async () => {
        ipcMain.once('list-accounts', (event, _) => {
          event.sender.send('response-list-accounts', ['accounts'])
        })
        const commitMock = jest.fn()
        const accounts = await Account.actions.loadAccounts({ commit: commitMock })
        expect(accounts).toEqual(['accounts'])
        expect(commitMock).toHaveBeenCalledWith('updateAccounts', ['accounts'])
      })
    })
    describe('removeAccount', () => {
      it('error', async () => {
        ipcMain.once('remove-account', (event, _) => {
          event.sender.send('error-remove-account', new RemoveAccountError())
        })
        const commitMock = jest.fn()
        await Account.actions.removeAccount({ commit: commitMock }, 'account')
          .catch((err) => {
            expect(err instanceof RemoveAccountError).toEqual(true)
          })
      })
      it('success', async () => {
        ipcMain.once('remove-account', (event, _) => {
          event.sender.send('response-remove-account', 1)
        })
        const commitMock = jest.fn()
        const res = await Account.actions.removeAccount({ commit: commitMock }, 'account')
        expect(res).toEqual(undefined)
      })
    })
    describe('forwardAccount', () => {
      it('error', async () => {
        ipcMain.once('forward-account', (event, _) => {
          event.sender.send('error-forward-account', new ForwardAccountError())
        })
        const commitMock = jest.fn()
        await Account.actions.forwardAccount({ commit: commitMock }, 'account')
          .catch((err) => {
            expect(err instanceof ForwardAccountError).toEqual(true)
          })
      })
      it('success', async () => {
        ipcMain.once('forward-account', (event, _) => {
          event.sender.send('response-forward-account', 1)
        })
        const commitMock = jest.fn()
        const res = await Account.actions.forwardAccount({ commit: commitMock }, 'account')
        expect(res).toEqual(undefined)
      })
    })
    describe('backwardAccount', () => {
      it('error', async () => {
        ipcMain.once('backward-account', (event, _) => {
          event.sender.send('error-backward-account', new BackwardAccountError())
        })
        const commitMock = jest.fn()
        await Account.actions.backwardAccount({ commit: commitMock }, 'account')
          .catch((err) => {
            expect(err instanceof BackwardAccountError).toEqual(true)
          })
      })
      it('success', async () => {
        ipcMain.once('backward-account', (event, _) => {
          event.sender.send('response-backward-account', 1)
        })
        const commitMock = jest.fn()
        const res = await Account.actions.backwardAccount({ commit: commitMock }, 'account')
        expect(res).toEqual(undefined)
      })
    })
    describe('removeAllAccounts', () => {
      it('error', async () => {
        ipcMain.once('remove-all-accounts', (event, _) => {
          event.sender.send('error-remove-all-accounts', new RemoveAllAccountsError())
        })
        const commitMock = jest.fn()
        await Account.actions.removeAllAccounts({ commit: commitMock }, 'account')
          .catch((err) => {
            expect(err instanceof RemoveAllAccountsError).toEqual(true)
          })
      })
      it('success', async () => {
        ipcMain.once('remove-all-accounts', (event, _) => {
          event.sender.send('response-remove-all-accounts', 1)
        })
        const commitMock = jest.fn()
        const res = await Account.actions.removeAllAccounts({ commit: commitMock }, 'account')
        expect(res).toEqual(undefined)
      })
    })
  })
})

class LoadAccountsError extends Error { }
class RemoveAccountError extends Error { }
class ForwardAccountError extends Error { }
class BackwardAccountError extends Error { }
class RemoveAllAccountsError extends Error { }
