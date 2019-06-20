import Theme from '~/src/constants/theme'
import DisplayStyle from '~/src/constants/displayStyle'
import TimeFormat from '~/src/constants/timeFormat'
import { LightTheme } from '~/src/constants/themeColor'
import DefaultFonts from '@/utils/fonts'
import Appearance, { AppearanceState, MUTATION_TYPES } from '@/store/Preferences/Appearance'

describe('Preferences/Appearance', () => {
  let state: AppearanceState
  beforeEach(() => {
    state = {
      appearance: {
        theme: Theme.Light.key,
        fontSize: 14,
        displayNameStyle: DisplayStyle.DisplayNameAndUsername.value,
        timeFormat: TimeFormat.Absolute.value,
        customThemeColor: LightTheme,
        font: DefaultFonts[0],
        tootPadding: 8
      },
      fonts: []
    }
  })
  describe('mutations', () => {
    describe('updateAppearance', () => {
      it('should be changed', () => {
        Appearance.mutations![MUTATION_TYPES.UPDATE_APPEARANCE](state, {
          theme: Theme.Dark.key
        })
        expect(state.appearance.theme).toEqual(Theme.Dark.key)
      })
    })
    describe('updateFonts', () => {
      it('should be changed', () => {
        Appearance.mutations![MUTATION_TYPES.UPDATE_FONTS](state, ['font'])
        expect(state.fonts).toEqual(['font'])
      })
    })
  })
})
