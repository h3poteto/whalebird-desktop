import Theme from '~/src/constants/theme'
import DisplayStyle from '~/src/constants/displayStyle'
import TimeFormat from '~/src/constants/timeFormat'
import { LightTheme } from '~/src/renderer/utils/theme'
import DefaultFonts from '@/utils/fonts'
import Appearance from '@/store/Preferences/Appearance'

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
})

