import Mentions from '@/store/TimelineSpace/Contents/Mentions'

describe('TimelineSpace/Contents/Mentions', () => {
  describe('mutations', () => {
    let state
    beforeEach(() => {
      state = {
        lazyLoading: false,
        heading: true,
        mentions: [],
        unreadMentions: [],
        filter: ''
      }
    })

    describe('appendMentions', () => {
      describe('heading', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            mentions: [5, 4, 3, 2, 1],
            unreadMentions: [],
            filter: ''
          }
        })
        it('should update mentions', () => {
          Mentions.mutations.appendMentions(state, 6)
          expect(state.mentions).toEqual([6, 5, 4, 3, 2, 1])
          expect(state.unreadMentions).toEqual([])
        })
      })
      describe('not heading', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: false,
            mentions: [5, 4, 3, 2, 1],
            unreadMentions: [],
            filter: ''
          }
        })
        it('should update mentions', () => {
          Mentions.mutations.appendMentions(state, 6)
          expect(state.mentions).toEqual([5, 4, 3, 2, 1])
          expect(state.unreadMentions).toEqual([6])
        })
      })
    })

    describe('mergeMentions', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: false,
          mentions: [5, 4, 3, 2, 1],
          unreadMentions: [8, 7, 6],
          filter: ''
        }
      })
      it('should be merged', () => {
        Mentions.mutations.mergeMentions(state)
        expect(state.mentions).toEqual([8, 7, 6, 5, 4, 3, 2, 1])
        expect(state.unreadMentions).toEqual([])
      })
    })

    describe('insertMentions', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: false,
          mentions: [5, 4, 3, 2, 1],
          unreadMentions: [],
          filter: ''
        }
      })
      it('should be inserted', () => {
        Mentions.mutations.insertMentions(state, [-1, -2, -3, -4])
        expect(state.mentions).toEqual([5, 4, 3, 2, 1, -1, -2, -3, -4])
      })
    })

    describe('updateToot', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: false,
          mentions: [
            { type: 'mention', status: { id: 20, favourited: false } },
            { type: 'favourite', status: { id: 19, favourited: false } },
            { type: 'reblog', status: { id: 18, favourited: false } },
            { type: 'follow', status: { id: 17, favourited: false } },
            { type: 'mention', status: { id: 16, favourited: false } }
          ],
          unreadMentions: [],
          filter: ''
        }
      })
      it('should be updated', () => {
        Mentions.mutations.updateToot(state, { id: 20, favourited: true })
        expect(state.mentions).toEqual(
          [
            { type: 'mention', status: { id: 20, favourited: true } },
            { type: 'favourite', status: { id: 19, favourited: false } },
            { type: 'reblog', status: { id: 18, favourited: false } },
            { type: 'follow', status: { id: 17, favourited: false } },
            { type: 'mention', status: { id: 16, favourited: false } }
          ]
        )
      })
    })
  })
})
