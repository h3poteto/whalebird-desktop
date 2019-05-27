import { Account, Status, Application } from 'megalodon'
import Home, { HomeState, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Home'

const account: Account = {
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
const status1: Status = {
  id: '1',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'hoge',
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
  application: {
    name: 'Web'
  } as Application,
  language: null,
  pinned: null
}
const status2: Status = {
  id: '2',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'fuga',
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
  application: {
    name: 'Web'
  } as Application,
  language: null,
  pinned: null
}

describe('TimelineSpace/Contents/Home', () => {
  describe('mutations', () => {
    let state: HomeState
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
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [status1],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should update timeline', () => {
          Home.mutations![MUTATION_TYPES.APPEND_TIMELINE](state, status2)
          expect(state.timeline).toEqual([status2, status1])
          expect(state.unreadTimeline).toEqual([])
        })
      })

      describe('not heading', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: false,
            timeline: [status1],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should update unreadTimeline', () => {
          Home.mutations![MUTATION_TYPES.APPEND_TIMELINE](state, status2)
          expect(state.timeline).toEqual([status1])
          expect(state.unreadTimeline).toEqual([status2])
        })
      })
    })

    describe('mergeTimeline', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: true,
          timeline: [status1],
          unreadTimeline: [status2],
          filter: '',
          showReblogs: true,
          showReplies: true
        }
      })
      it('should be merged', () => {
        Home.mutations![MUTATION_TYPES.MERGE_TIMELINE](state, null)
        expect(state.timeline).toEqual([status2, status1])
        expect(state.unreadTimeline).toEqual([])
      })
    })

    describe('insertTimeline', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: true,
          timeline: [status1],
          unreadTimeline: [],
          filter: '',
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
            timeline: [status1, status2],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        const favouritedStatus: Status = Object.assign(status1, {
          favourited: true
        })
        it('should be updated', () => {
          Home.mutations![MUTATION_TYPES.UPDATE_TOOT](state, favouritedStatus)
          expect(state.timeline).toEqual([favouritedStatus, status2])
        })
      })
      describe('message is reblogged', () => {
        const rebloggedStatus: Status = {
          id: '3',
          uri: 'http://example.com',
          url: 'http://example.com',
          account: account,
          in_reply_to_id: null,
          in_reply_to_account_id: null,
          reblog: status1,
          content: '',
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
          application: {
            name: 'Web'
          } as Application,
          language: null,
          pinned: null
        }
        const favouritedStatus: Status = Object.assign(status1, {
          favourited: true
        })
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [rebloggedStatus, status2],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be updated', () => {
          Home.mutations![MUTATION_TYPES.UPDATE_TOOT](state, favouritedStatus)
          expect(state.timeline[0].reblog).not.toBeNull()
          expect(state.timeline[0].reblog!.favourited).toEqual(true)
        })
      })
    })

    describe('deleteToot', () => {
      describe('message is not reblogged', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [status1, status2],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be deleted', () => {
          Home.mutations![MUTATION_TYPES.DELETE_TOOT](state, status1)
          expect(state.timeline).toEqual([status2])
        })
      })

      describe('message is reblogged', () => {
        beforeEach(() => {
          const rebloggedStatus: Status = {
            id: '3',
            uri: 'http://example.com',
            url: 'http://example.com',
            account: account,
            in_reply_to_id: null,
            in_reply_to_account_id: null,
            reblog: status1,
            content: '',
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
            application: {
              name: 'Web'
            } as Application,
            language: null,
            pinned: null
          }
          state = {
            lazyLoading: false,
            heading: true,
            timeline: [rebloggedStatus, status2],
            unreadTimeline: [],
            filter: '',
            showReblogs: true,
            showReplies: true
          }
        })
        it('should be deleted', () => {
          Home.mutations![MUTATION_TYPES.DELETE_TOOT](state, status1)
          expect(state.timeline).toEqual([status2])
        })
      })
    })
  })
})
