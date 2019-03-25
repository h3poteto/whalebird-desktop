import Authorize from '@/store/Authorize'
import { ipcMain } from '~/spec/mock/electron'

describe.skip('Authorize', () => {
  // TODO: integration
  describe('actions', () => {
    describe('error', () => {
      it('should return error', async () => {
        ipcMain.once('get-access-token', (event, _) => {
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
        ipcMain.once('get-access-token', (event, _) => {
          event.sender.send('response-get-access-token', 'abcd')
        })
        const commitMock = jest.fn()
        const id = await Authorize.actions.submit({ commit: commitMock }, 'code')
        expect(id).toEqual('abcd')
      })
    })
  })
})

class AccessTokenError extends Error { }
