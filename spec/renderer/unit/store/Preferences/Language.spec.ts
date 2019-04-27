import Language, { LanguageState, MUTATION_TYPES } from '@/store/Preferences/Language'
import DefaultLanguage from '~/src/constants/language'

describe('Preferences/Language', () => {
  let state: LanguageState
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
        Language.mutations![MUTATION_TYPES.UPDATE_LANGUAGE](state, {
          language: DefaultLanguage.ja.key
        })
        expect(state.language.language).toEqual(DefaultLanguage.ja.key)
      })
    })
    describe('changeLanguage', () => {
      it('should be changed', () => {
        Language.mutations![MUTATION_TYPES.CHANGE_LANGUAGE](state, DefaultLanguage.ja.key)
        expect(state.language.language).toEqual(DefaultLanguage.ja.key)
      })
    })
  })
})
