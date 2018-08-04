import assert from 'assert'
import suggestText from '../../src/renderer/utils/suggestText'

describe('account', () => {
  context('Only account name', () => {
    const str = '@h3pote'
    it('should match', () => {
      const [start, word] = suggestText(str, 7)
      assert.strictEqual(str, word)
      assert.strictEqual(start, 1)
    })
  })
  context('Beginning of the sentence', () => {
    const str = '@h3pote toot body'
    it('should match', () => {
      const [start, word] = suggestText(str, 7)
      assert.strictEqual(word, '@h3pote')
      assert.strictEqual(start, 1)
    })
  })
  context('Halfway of the sentence', () => {
    const str = 'toot body @h3pote toot'
    it('should match', () => {
      const [start, word] = suggestText(str, 17)
      assert.strictEqual(word, '@h3pote')
      assert.strictEqual(start, 11)
    })
  })
  context('End of the sentence', () => {
    const str = 'toot body @h3pote'
    it('should match', () => {
      const [start, word] = suggestText(str, 17)
      assert.strictEqual(word, '@h3pote')
      assert.strictEqual(start, 11)
    })
  })
  context('No space', () => {
    const str = 'tootbody@h3pote'
    it('should not match', () => {
      const [start, word] = suggestText(str, 15)
      assert.strictEqual(word, null)
      assert.strictEqual(start, null)
    })
  })
})
