import { domainFormat } from '@/utils/validator'

describe('validator', () => {
  describe('domainFormat', () => {
    describe('string contains protocol', () => {
      const domain = 'https://mastodon.social'
      it('should not match', () => {
        const res = domain.search(domainFormat)
        expect(res).toEqual(-1)
      })
    })
    describe('string contains account name', () => {
      const domain = 'h3_poteto@mastodon.social'
      it('should not match', () => {
        const res = domain.search(domainFormat)
        expect(res).toEqual(-1)
      })
    })
    describe('string is gTLD domain', () => {
      const domain = 'mastodon.social'
      it('should match', () => {
        const res = domain.search(domainFormat)
        expect(res).toEqual(0)
      })
    })
    describe('string is subdomain', () => {
      const domain = 'music.mastodon.social'
      it('should match', () => {
        const res = domain.search(domainFormat)
        expect(res).toEqual(0)
      })
    })
    describe('string is subdomain', () => {
      const domain = 'social.tchncs.de'
      it('should match', () => {
        const res = domain.search(domainFormat)
        expect(res).toEqual(0)
      })
    })
    describe('string is jp domain', () => {
      const domain = 'mstdn.co.jp'
      it('should match', () => {
        const res = domain.search(domainFormat)
        expect(res).toEqual(0)
      })
    })
    describe('string contains hyphone', () => {
      const domain = 'music-mastodon.social'
      it('should match', () => {
        const res = domain.search(domainFormat)
        expect(res).toEqual(0)
      })
    })
    describe('string is short domain', () => {
      const domain = 'id.cc'
      it('should match', () => {
        const res = domain.search(domainFormat)
        expect(res).toEqual(0)
      })
    })
  })
})
