import suggestText from '@/utils/suggestText'

describe('account', () => {
  describe('Only account name', () => {
    const str = '@h3pote'
    it('should match', () => {
      const [start, word] = suggestText(str, 7)
      expect(str).toEqual(word)
      expect(start).toEqual(1)
    })
  })
  describe('Beginning of the sentence', () => {
    const str = '@h3pote toot body'
    it('should match', () => {
      const [start, word] = suggestText(str, 7)
      expect(word).toEqual('@h3pote')
      expect(start).toEqual(1)
    })
  })
  describe('Halfway of the sentence', () => {
    const str = 'toot body @h3pote toot'
    it('should match', () => {
      const [start, word] = suggestText(str, 17)
      expect(word).toEqual('@h3pote')
      expect(start).toEqual(11)
    })
  })
  describe('End of the sentence', () => {
    const str = 'toot body @h3pote'
    it('should match', () => {
      const [start, word] = suggestText(str, 17)
      expect(word).toEqual('@h3pote')
      expect(start).toEqual(11)
    })
  })
  describe('No space', () => {
    const str = 'tootbody@h3pote'
    it('should not match', () => {
      const [start, word] = suggestText(str, 15)
      expect(word).toEqual(null)
      expect(start).toEqual(null)
    })
  })
})
