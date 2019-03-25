import Theme from '~/src/constants/theme'
import DisplayStyle from '~/src/constants/displayStyle'
import TimeFormat from '~/src/constants/timeFormat'
import { LightTheme } from '~/src/renderer/utils/theme'
import DefaultFonts from '@/utils/fonts'
import Appearance from '@/store/Preferences/Appearance'
import { ipcMain } from '~/spec/mock/electron'

describe('Preferences/Appearance', () => {
  let state
  beforeEach(() => {
    state = {
      appearance: {
        theme: Theme.Light.key,
        fontSize: 14,
        displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
        timeFormat: TimeFormat.Absolute.value,
        customThemeColor: LightTheme,
        font: DefaultFonts[0]
      },
      fonts: []
    }
  })
  describe('mutations', () => {
    describe('updateAppearance', () => {
      it('should be changed', () => {
        Appearance.mutations.updateAppearance(state, {
          theme: Theme.Dark.key
        })
        expect(state.appearance.theme).toEqual(Theme.Dark.key)
      })
    })
    describe('updateFonts', () => {
      it('should be changed', () => {
        Appearance.mutations.updateFonts(state, ['font'])
        expect(state.fonts).toEqual(['font'])
      })
    })
  })

  describe('actions', () => {
    describe('loadAppearance', () => {
      it('error', async () => {
        ipcMain.once('get-preferences', (event, _) => {
          event.sender.send('error-get-preferences', new LoadAppearanceError())
        })
        const commitMock = jest.fn()
        await Appearance.actions.loadAppearance({ commit: commitMock })
          .catch((err) => {
            expect(err instanceof LoadAppearanceError).toEqual(true)
          })
      })
      it('success', async () => {
        const conf = {
          appearance: {
            theme: Theme.Dark.key
          }
        }
        ipcMain.once('get-preferences', (event, _) => {
          event.sender.send('response-get-preferences', conf)
        })
        const commitMock = jest.fn()
        const c = await Appearance.actions.loadAppearance({ commit: commitMock })
        expect(c).toEqual(conf)
        expect(commitMock).toHaveBeenCalledWith('updateAppearance', conf.appearance)
      })
    })
    describe('loadFonts', () => {
      it('error', async () => {
        ipcMain.once('list-fonts', (event, _) => {
          event.sender.send('error-list-fonts', new ListFontsError())
        })
        const commitMock = jest.fn()
        await Appearance.actions.loadFonts({ commit: commitMock })
          .catch((err) => {
            expect(err instanceof ListFontsError).toEqual(true)
          })
      })
      it('success', async () => {
        ipcMain.once('list-fonts', (event, _) => {
          event.sender.send('response-list-fonts', ['fonts'])
        })
        const commitMock = jest.fn()
        const fonts = await Appearance.actions.loadFonts({ commit: commitMock })
        expect(fonts).toEqual(['fonts'])
        expect(commitMock).toHaveBeenCalledWith('updateFonts', [DefaultFonts[0]].concat(['fonts']))
      })
    })
  })
})

class LoadAppearanceError extends Error { }
class ListFontsError extends Error { }
