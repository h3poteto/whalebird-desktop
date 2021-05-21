import filtered from '@/utils/filter'
import { Entity } from 'megalodon'

describe('filter', () => {
  describe('whole word is enabled', () => {
    describe('Only asci', () => {
      const filters = [
        {
          id: '1',
          phrase: 'Fedi',
          context: ['home'],
          expires_at: null,
          irreversible: false,
          whole_word: true
        } as Entity.Filter
      ]
      it('should not be matched', () => {
        const status =
          'Pleroma is social networking software compatible with other Fediverse software such as Mastodon, Misskey, Pixelfed and many others.'
        const res = filtered(status, filters)
        expect(res).toBeFalsy()
      })
      it('should be matched', () => {
        const status =
          'Pleroma is social networking software compatible with other Fedi software such as Mastodon, Misskey, Pixelfed and many others.'
        const res = filtered(status, filters)
        expect(res).toBeTruthy()
      })
    })
    describe('With Japanese', () => {
      const filters = [
        {
          id: '1',
          phrase: 'ミニブログ',
          context: ['home'],
          expires_at: null,
          irreversible: false,
          whole_word: true
        } as Entity.Filter
      ]
      it('should be matched', () => {
        const status =
          'マストドン (Mastodon) はミニブログサービスを提供するためのフリーソフトウェア、またはこれが提供する連合型のソーシャルネットワークサービスである'
        const res = filtered(status, filters)
        expect(res).toBeTruthy()
      })
      it('should not be matched', () => {
        const status =
          '「脱中央集権型」 (decentralized) のマストドンのサーバーはだれでも自由に運用する事が可能であり、利用者は通常このサーバーの一つを選んで所属するが、異なるサーバーに属する利用者間のコミュニケーションも容易である'
        const res = filtered(status, filters)
        expect(res).toBeFalsy()
      })
    })
  })

  describe('whole word is disabled', () => {
    describe('Only asci', () => {
      const filters = [
        {
          id: '1',
          phrase: 'Fedi',
          context: ['home'],
          expires_at: null,
          irreversible: false,
          whole_word: false
        } as Entity.Filter
      ]
      it('should be matched', () => {
        const status =
          'Pleroma is social networking software compatible with other Fediverse software such as Mastodon, Misskey, Pixelfed and many others.'
        const res = filtered(status, filters)
        expect(res).toBeTruthy()
      })
      it('should be matched', () => {
        const status =
          'Pleroma is social networking software compatible with other Fedi software such as Mastodon, Misskey, Pixelfed and many others.'
        const res = filtered(status, filters)
        expect(res).toBeTruthy()
      })
    })
    describe('With Japanese', () => {
      const filters = [
        {
          id: '1',
          phrase: 'ミニブログ',
          context: ['home'],
          expires_at: null,
          irreversible: false,
          whole_word: true
        } as Entity.Filter
      ]
      it('should be matched', () => {
        const status =
          'マストドン (Mastodon) はミニブログサービスを提供するためのフリーソフトウェア、またはこれが提供する連合型のソーシャルネットワークサービスである'
        const res = filtered(status, filters)
        expect(res).toBeTruthy()
      })
      it('should not be matched', () => {
        const status =
          '「脱中央集権型」 (decentralized) のマストドンのサーバーはだれでも自由に運用する事が可能であり、利用者は通常このサーバーの一つを選んで所属するが、異なるサーバーに属する利用者間のコミュニケーションも容易である'
        const res = filtered(status, filters)
        expect(res).toBeFalsy()
      })
    })
  })
})
