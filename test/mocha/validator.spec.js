import assert from 'assert'
import { domainFormat } from '../../src/renderer/utils/validator'

describe('validator', () => {
  describe('domainFormat', () => {
    context('string contains protocol', () => {
      const domain = 'https://mastodon.social'
      it('should not match', () => {
        const res = domain.search(domainFormat)
        assert.equal(res, -1)
      })
    })
    context('string contains account name', () => {
      const domain = 'h3_poteto@mastodon.social'
      it('should not match', () => {
        const res = domain.search(domainFormat)
        assert.equal(res, -1)
      })
    })
    context('string is gTLD domain', () => {
      const domain = 'mastodon.social'
      it('should match', () => {
        const res = domain.search(domainFormat)
        assert.equal(res, 0)
      })
    })
    context('string is subdomain', () => {
      const domain = 'music.mastodon.social'
      it('should match', () => {
        const res = domain.search(domainFormat)
        assert.equal(res, 0)
      })
    })
    context('string is subdomain', () => {
      const domain = 'social.tchncs.de'
      it('should match', () => {
        const res = domain.search(domainFormat)
        assert.equal(res, 0)
      })
    })
    context('string is jp domain', () => {
      const domain = 'mstdn.co.jp'
      it('should match', () => {
        const res = domain.search(domainFormat)
        assert.equal(res, 0)
      })
    })
    context('string contains hyphone', () => {
      const domain = 'music-mastodon.social'
      it('should match', () => {
        const res = domain.search(domainFormat)
        assert.equal(res, 0)
      })
    })
  })
})
