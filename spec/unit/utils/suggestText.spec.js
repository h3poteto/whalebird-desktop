import assert from 'assert'
import suggestText from '@/utils/suggestText'

describe('account', () => {
  describe('Only account name', () => {
    const str = '@h3pote'
    it('should match', () => {
      const [start, word] = suggestText(str, 7)
      assert.strictEqual(str, word)
      assert.strictEqual(start, 1)
    })
  })
  describe('Beginning of the sentence', () => {
    const str = '@h3pote toot body'
    it('should match', () => {
      const [start, word] = suggestText(str, 7)
      assert.strictEqual(word, '@h3pote')
      assert.strictEqual(start, 1)
    })
  })
  describe('Halfway of the sentence', () => {
    const str = 'toot body @h3pote toot'
    it('should match', () => {
      const [start, word] = suggestText(str, 17)
      assert.strictEqual(word, '@h3pote')
      assert.strictEqual(start, 11)
    })
  })
  describe('End of the sentence', () => {
    const str = 'toot body @h3pote'
    it('should match', () => {
      const [start, word] = suggestText(str, 17)
      assert.strictEqual(word, '@h3pote')
      assert.strictEqual(start, 11)
    })
  })
  describe('No space', () => {
    const str = 'tootbody@h3pote'
    it('should not match', () => {
      const [start, word] = suggestText(str, 15)
      assert.strictEqual(word, null)
      assert.strictEqual(start, null)
    })
  })
})
