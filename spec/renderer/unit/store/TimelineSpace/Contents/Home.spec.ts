import Home from '@/store/TimelineSpace/Contents/Home'

describe('TimelineSpace/Contents/Home', () => {
  describe('mutations', () => {
    let state
    beforeEach(() => {
      state = {
        lazyLoading: false,
        heading: true,
        timeline: [],
        unreadTimeline: [],
        filter: '',
        showReblogs: true,
        showReplies: true
      }
    })

    describe('changeLazyLoading', () => {
      it('should be change', () => {
        Home.mutations.changeLazyLoading(state, true)
        expect(state.lazyLoading).toEqual(true)
      })
    })

    describe('changeHeading', () => {
      it('should be change', () => {
        Home.mutations.changeHeading(state, false)
        expect(state.heading).toEqual(false)
      })
    })

    describe('appendTimeline', () => {
      describe('heading', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [5, 4, 3, 2, 1, 0],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should update timeline', () => {
          Home.mutations.appendTimeline(state, 6)
          expect(state.timeline).toEqual([6, 5, 4, 3, 2, 1, 0])
          expect(state.unreadTimeline).toEqual([])
        })
      })

      describe('not heading', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: false,
            timeline: [5, 4, 3, 2, 1, 0],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should update unreadTimeline', () => {
          Home.mutations.appendTimeline(state, 6)
          expect(state.timeline).toEqual([5, 4, 3, 2, 1, 0])
          expect(state.unreadTimeline).toEqual([6])
        })
      })
    })

    describe('mergeTimeline', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: true,
          timeline: [5, 4, 3, 2, 1, 0],
          unreadTimeline: [8, 7, 6],
          filter: '',
          showReblogs: true,
          showReplies: true
        }
      })
      it('should be merged', () => {
        Home.mutations.mergeTimeline(state)
        expect(state.timeline).toEqual([8, 7, 6, 5, 4, 3, 2, 1, 0])
        expect(state.unreadTimeline).toEqual([])
      })
    })

    describe('insertTimeline', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: true,
          timeline: [5, 4, 3, 2, 1, 0],
          unreadTimeline: [],
          filter: '',
          showReblogs: true,
          showReplies: true
        }
      })
      it('should be inserted', () => {
        Home.mutations.insertTimeline(state, [-1, -2, -3, -4])
        expect(state.timeline).toEqual([5, 4, 3, 2, 1, 0, -1, -2, -3, -4])
      })
    })

    describe('updateToot', () => {
      describe('message is not reblogged', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [
              {
                id: 3,
                reblog: null,
                text: '3rd'
              },
              {
                id: 2,
                reblog: null,
                text: '2nd'
              },
              {
                id: 1,
                reblog: null,
                text: '1st'
              },
              {
                id: 0,
                reblog: null,
                text: 'zero'
              }
            ],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be updated', () => {
          Home.mutations.updateToot(state, {
            id: 2,
            reblog: null,
            text: 'second'
          })
          expect(state.timeline[1]).toEqual({
            id: 2,
            reblog: null,
            text: 'second'
          })
        })
      })
      describe('message is reblogged', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [
              {
                id: 3,
                reblog: null,
                text: '3rd'
              },
              {
                id: 2,
                reblog: null,
                text: '2nd'
              },
              {
                id: 1,
                reblog: {
                  id: -1,
                  reblog: null,
                  text: 'reblogged message'
                },
                text: null
              },
              {
                id: 0,
                reblog: null,
                text: 'zero'
              }
            ],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be updated', () => {
          Home.mutations.updateToot(state, {
            id: -1,
            reblog: null,
            text: 'negative id'
          })
          expect(state.timeline[2]).toEqual({
            id: 1,
            reblog: {
              id: -1,
              reblog: null,
              text: 'negative id'
            },
            text: null
          })
        })
      })
    })

    describe('deleteToot', () => {
      describe('message is not reblogged', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [
              {
                id: 3,
                reblog: null,
                text: '3rd'
              },
              {
                id: 2,
                reblog: null,
                text: '2nd'
              },
              {
                id: 1,
                reblog: null,
                text: 'first'
              },
              {
                id: 0,
                reblog: null,
                text: 'zero'
              }
            ],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be deleted', () => {
          Home.mutations.deleteToot(state, {
            id: 0,
            reblog: null,
            text: 'zero'
          })
          expect(state.timeline).toEqual([
            {
              id: 3,
              reblog: null,
              text: '3rd'
            },
            {
              id: 2,
              reblog: null,
              text: '2nd'
            },
            {
              id: 1,
              reblog: null,
              text: 'first'
            }
          ])
        })
      })

      describe('message is reblogged', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [
              {
                id: 3,
                reblog: null,
                text: '3rd'
              },
              {
                id: 2,
                reblog: null,
                text: '2nd'
              },
              {
                id: 1,
                reblog: {
                  id: -1,
                  reblog: null,
                  text: 'reblogged toot'
                },
                text: 'first'
              },
              {
                id: 0,
                reblog: null,
                text: 'zero'
              }
            ],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be deleted', () => {
          Home.mutations.deleteToot(state, {
            id: -1,
            reblog: null,
            text: 'reblogged toot'
          })
          expect(state.timeline).toEqual([
            {
              id: 3,
              reblog: null,
              text: '3rd'
            },
            {
              id: 2,
              reblog: null,
              text: '2nd'
            },
            {
              id: 0,
              reblog: null,
              text: 'zero'
            }
          ])
        })
      })
    })
  })
})
