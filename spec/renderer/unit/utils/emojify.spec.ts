import emojify from '@/utils/emojify'

describe('emojify', () => {
  const emoji = [
    {
      shortcode: 'python',
      url: 'https://example.com/python'
    },
    {
      shortcode: 'nodejs',
      url: 'https://example.com/nodejs'
    },
    {
      shortcode: 'slack',
      url: 'https://example.com/slack'
    }
  ]
  describe('Does not contain shortcode', () => {
    const str = 'I have a pen.'
    it('should not change', () => {
      const result = emojify(str, emoji)
      expect(result).toEqual(str)
    })
  })
  describe('Contain a shortcode', () => {
    const str = 'I like :python:'
    it('should replace', () => {
      const result = emojify(str, emoji)
      expect(result).toEqual(
        'I like <img draggable="false" class="emojione" alt="python" title="python" src="https://example.com/python" />'
      )
    })
  })
  describe('Contain some shortcodes', () => {
    const str = 'I like :python: , :nodejs: and :slack:'
    it('should replace', () => {
      const result = emojify(str, emoji)
      expect(result).toEqual(
        'I like <img draggable="false" class="emojione" alt="python" title="python" src="https://example.com/python" /> , <img draggable="false" class="emojione" alt="nodejs" title="nodejs" src="https://example.com/nodejs" /> and <img draggable="false" class="emojione" alt="slack" title="slack" src="https://example.com/slack" />'
      )
    })
  })
  describe('Contain same shortcodes', () => {
    const str = 'I like :python: , I love :python:'
    it('should replace', () => {
      const result = emojify(str, emoji)
      expect(result).toEqual(
        'I like <img draggable="false" class="emojione" alt="python" title="python" src="https://example.com/python" /> , I love <img draggable="false" class="emojione" alt="python" title="python" src="https://example.com/python" />'
      )
    })
  })
})
