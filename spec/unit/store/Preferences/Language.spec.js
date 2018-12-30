import Language from '@/store/Preferences/Language'
import DefaultLanguage from '~/src/constants/language'

describe('Preferences/Language', () => {
  let state
  beforeEach(() => {
    state = {
      language: {
        language: DefaultLanguage.en.key
      }
    }
  })
  describe('mutations', () => {
    describe('updateLanguage', () => {
      it('should be updated', () => {
        Language.mutations.updateLanguage(state, {
          language: DefaultLanguage.ja.key
        })
        expect(state.language.language).toEqual(DefaultLanguage.ja.key)
      })
    })
    describe('changeLanguage', () => {
      it('should be changed', () => {
        Language.mutations.changeLanguage(state, DefaultLanguage.ja.key)
        expect(state.language.language).toEqual(DefaultLanguage.ja.key)
      })
    })
  })
})
