import Authorize from '@/store/Authorize'
import { ipcMain } from '~/spec/mock/electron'

describe('Authorize', () => {
  describe('actions', () => {
    describe('error', () => {
      it('should return error', async () => {
        ipcMain.once('get-access-token', (event, code) => {
          event.sender.send('error-get-access-token', new AccessTokenError())
        })
        const commitMock = jest.fn()
        await Authorize.actions.submit({ commit: commitMock }, 'code')
          .catch((err) => {
            expect(err instanceof AccessTokenError).toEqual(true)
          })
      })
    })
    describe('success', () => {
      it('should return id', async () => {
        ipcMain.once('get-access-token', (event, code) => {
          event.sender.send('response-get-access-token', 'abcd')
        })
        const commitMock = jest.fn()
        const id = await Authorize.actions.submit({ commit: commitMock }, 'code')
        expect(id).toEqual('abcd')
      })
    })
  })
})

class AccessTokenError extends Error {}
