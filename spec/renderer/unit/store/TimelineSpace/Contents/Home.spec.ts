import { Entity } from 'megalodon'
import Home, { HomeState, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Home'

const account: Entity.Account = {
  id: '1',
  username: 'h3poteto',
  acct: 'h3poteto@pleroma.io',
  display_name: 'h3poteto',
  locked: false,
  created_at: '2019-03-26T21:30:32',
  followers_count: 10,
  following_count: 10,
  statuses_count: 100,
  note: 'engineer',
  url: 'https://pleroma.io',
  avatar: '',
  avatar_static: '',
  header: '',
  header_static: '',
  emojis: [],
  moved: null,
  fields: null,
  bot: false
}
const status1: Entity.Status = {
  id: '1',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'hoge',
  plain_content: 'hoge',
  created_at: '2019-03-26T21:40:32',
  emojis: [],
  replies_count: 0,
  reblogs_count: 0,
  favourites_count: 0,
  reblogged: null,
  favourited: null,
  muted: null,
  sensitive: false,
  spoiler_text: '',
  visibility: 'public',
  media_attachments: [],
  mentions: [],
  tags: [],
  card: null,
  poll: null,
  application: {
    name: 'Web'
  } as Entity.Application,
  language: null,
  pinned: null,
  emoji_reactions: [],
  bookmarked: false,
  quote: false
}
const status2: Entity.Status = {
  id: '2',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'fuga',
  plain_content: 'fuga',
  created_at: '2019-03-26T21:40:32',
  emojis: [],
  replies_count: 0,
  reblogs_count: 0,
  favourites_count: 0,
  reblogged: null,
  favourited: null,
  muted: null,
  sensitive: false,
  spoiler_text: '',
  visibility: 'public',
  media_attachments: [],
  mentions: [],
  tags: [],
  card: null,
  poll: null,
  application: {
    name: 'Web'
  } as Entity.Application,
  language: null,
  pinned: null,
  emoji_reactions: [],
  bookmarked: false,
  quote: false
}

describe('TimelineSpace/Contents/Home', () => {
  describe('mutations', () => {
    let state: HomeState
    beforeEach(() => {
      state = {
        lazyLoading: false,
        heading: true,
        scrolling: false,
        timeline: [],
        showReblogs: true,
        showReplies: true
      }
    })

    describe('changeLazyLoading', () => {
      it('should be change', () => {
        Home.mutations![MUTATION_TYPES.CHANGE_LAZY_LOADING](state, true)
        expect(state.lazyLoading).toEqual(true)
      })
    })

    describe('changeHeading', () => {
      it('should be change', () => {
        Home.mutations![MUTATION_TYPES.CHANGE_HEADING](state, false)
        expect(state.heading).toEqual(false)
      })
    })

    describe('appendTimeline', () => {
      describe('heading', () => {
        describe('normal', () => {
          beforeEach(() => {
            state = {
              lazyLoading: false,
              heading: true,
              scrolling: false,
              timeline: [status1],
              showReblogs: true,
              showReplies: true
            }
          })
          it('should update timeline', () => {
            Home.mutations![MUTATION_TYPES.APPEND_TIMELINE](state, status2)
            expect(state.timeline).toEqual([status2, status1])
          })
        })

        describe('duplicated status', () => {
          beforeEach(() => {
            state = {
              lazyLoading: false,
              heading: true,
              scrolling: false,
              timeline: [status2, status1],
              showReblogs: true,
              showReplies: true
            }
          })
          it('should not update timeline', () => {
            Home.mutations![MUTATION_TYPES.APPEND_TIMELINE](state, status2)
            expect(state.timeline).toEqual([status2, status1])
          })
        })
      })

      describe('not heading', () => {
        describe('normal', () => {
          beforeEach(() => {
            state = {
              lazyLoading: false,
              heading: false,
              scrolling: false,
              timeline: [status1],
              showReblogs: true,
              showReplies: true
            }
          })
          it('should update timeline', () => {
            Home.mutations![MUTATION_TYPES.APPEND_TIMELINE](state, status2)
            expect(state.timeline).toEqual([status2, status1])
          })
        })
        describe('duplicated status', () => {
          beforeEach(() => {
            state = {
              lazyLoading: false,
              heading: false,
              scrolling: false,
              timeline: [status2, status1],
              showReblogs: true,
              showReplies: true
            }
          })
          it('should not update timeline', () => {
            Home.mutations![MUTATION_TYPES.APPEND_TIMELINE](state, status2)
            expect(state.timeline).toEqual([status2, status1])
          })
        })
      })
    })

    describe('insertTimeline', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: true,
          scrolling: false,
          timeline: [status1],
          showReblogs: true,
          showReplies: true
        }
      })
      it('should be inserted', () => {
        Home.mutations![MUTATION_TYPES.INSERT_TIMELINE](state, [status2])
        expect(state.timeline).toEqual([status1, status2])
      })
    })

    describe('updateToot', () => {
      describe('message is not reblogged', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            scrolling: false,
            timeline: [status1, status2],
            showReblogs: true,
            showReplies: true
          }
        })
        const favouritedStatus: Entity.Status = Object.assign(status1, {
          favourited: true
        })
        it('should be updated', () => {
          Home.mutations![MUTATION_TYPES.UPDATE_TOOT](state, favouritedStatus)
          expect(state.timeline).toEqual([favouritedStatus, status2])
        })
      })
      describe('message is reblogged', () => {
        const rebloggedStatus: Entity.Status = {
          id: '3',
          uri: 'http://example.com',
          url: 'http://example.com',
          account: account,
          in_reply_to_id: null,
          in_reply_to_account_id: null,
          reblog: status1,
          content: '',
          plain_content: null,
          created_at: '2019-03-31T21:40:32',
          emojis: [],
          replies_count: 0,
          reblogs_count: 0,
          favourites_count: 0,
          reblogged: null,
          favourited: null,
          muted: null,
          sensitive: false,
          spoiler_text: '',
          visibility: 'public',
          media_attachments: [],
          mentions: [],
          tags: [],
          card: null,
          poll: null,
          application: {
            name: 'Web'
          } as Entity.Application,
          language: null,
          pinned: null,
          emoji_reactions: [],
          bookmarked: false,
          quote: false
        }
        const favouritedStatus: Entity.Status = Object.assign(status1, {
          favourited: true
        })
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            scrolling: false,
            timeline: [rebloggedStatus, status2],
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be updated', () => {
          Home.mutations![MUTATION_TYPES.UPDATE_TOOT](state, favouritedStatus)
          expect((state.timeline[0] as Entity.Status).reblog).not.toBeNull()
          expect((state.timeline[0] as Entity.Status).reblog!.favourited).toEqual(true)
        })
      })
    })

    describe('deleteToot', () => {
      describe('message is not reblogged', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            scrolling: false,
            timeline: [status1, status2],
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be deleted', () => {
          Home.mutations![MUTATION_TYPES.DELETE_TOOT](state, status1.id)
          expect(state.timeline).toEqual([status2])
        })
      })

      describe('message is reblogged', () => {
        beforeEach(() => {
          const rebloggedStatus: Entity.Status = {
            id: '3',
            uri: 'http://example.com',
            url: 'http://example.com',
            account: account,
            in_reply_to_id: null,
            in_reply_to_account_id: null,
            reblog: status1,
            content: '',
            plain_content: null,
            created_at: '2019-03-31T21:40:32',
            emojis: [],
            replies_count: 0,
            reblogs_count: 0,
            favourites_count: 0,
            reblogged: null,
            favourited: null,
            muted: null,
            sensitive: false,
            spoiler_text: '',
            visibility: 'public',
            media_attachments: [],
            mentions: [],
            tags: [],
            card: null,
            poll: null,
            application: {
              name: 'Web'
            } as Entity.Application,
            language: null,
            pinned: null,
            emoji_reactions: [],
            bookmarked: false,
            quote: false
          }
          state = {
            lazyLoading: false,
            heading: true,
            scrolling: false,
            timeline: [rebloggedStatus, status2],
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be deleted', () => {
          Home.mutations![MUTATION_TYPES.DELETE_TOOT](state, status1.id)
          expect(state.timeline).toEqual([status2])
        })
      })
    })
  })
})
