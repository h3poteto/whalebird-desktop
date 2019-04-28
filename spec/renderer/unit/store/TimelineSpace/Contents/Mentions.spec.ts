import { Account, Notification, Status, Application } from 'megalodon'
import Mentions, { MentionsState, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/Mentions'

const account1: Account = {
  id: 1,
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

const account2: Account = {
  id: 2,
  username: 'h3poteto',
  acct: 'h3poteto@mstdn.io',
  display_name: 'h3poteto',
  locked: false,
  created_at: '2019-03-26T21:30:32',
  followers_count: 10,
  following_count: 10,
  statuses_count: 100,
  note: 'engineer',
  url: 'https://mstdn.io',
  avatar: '',
  avatar_static: '',
  header: '',
  header_static: '',
  emojis: [],
  moved: null,
  fields: null,
  bot: false
}

const status: Status = {
  id: 1,
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account1,
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

const notification1: Notification = {
  id: 1,
  account: account2,
  status: status,
  type: 'favourite',
  created_at: '2019-04-01T17:01:32'
}

const notification2: Notification = {
  id: 2,
  account: account2,
  status: status,
  type: 'reblog',
  created_at: '2019-04-01T17:01:32'
}

describe('TimelineSpace/Contents/Mentions', () => {
  describe('mutations', () => {
    let state: MentionsState
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
            mentions: [notification1],
            unreadMentions: [],
            filter: ''
          }
        })
        it('should update mentions', () => {
          Mentions.mutations![MUTATION_TYPES.APPEND_MENTIONS](state, notification2)
          expect(state.mentions).toEqual([notification2, notification1])
          expect(state.unreadMentions).toEqual([])
        })
      })
      describe('not heading', () => {
        beforeEach(() => {
          state = {
            lazyLoading: false,
            heading: false,
            mentions: [notification1],
            unreadMentions: [],
            filter: ''
          }
        })
        it('should update mentions', () => {
          Mentions.mutations![MUTATION_TYPES.APPEND_MENTIONS](state, notification2)
          expect(state.mentions).toEqual([notification1])
          expect(state.unreadMentions).toEqual([notification2])
        })
      })
    })

    describe('mergeMentions', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: false,
          mentions: [notification1],
          unreadMentions: [notification2],
          filter: ''
        }
      })
      it('should be merged', () => {
        Mentions.mutations![MUTATION_TYPES.MERGE_MENTIONS](state, null)
        expect(state.mentions).toEqual([notification2, notification1])
        expect(state.unreadMentions).toEqual([])
      })
    })

    describe('insertMentions', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: false,
          mentions: [notification2],
          unreadMentions: [],
          filter: ''
        }
      })
      it('should be inserted', () => {
        Mentions.mutations![MUTATION_TYPES.INSERT_MENTIONS](state, [notification1])
        expect(state.mentions).toEqual([notification2, notification1])
      })
    })

    describe('updateToot', () => {
      beforeEach(() => {
        state = {
          lazyLoading: false,
          heading: false,
          mentions: [notification2, notification1],
          unreadMentions: [],
          filter: ''
        }
      })
      it('should be updated', () => {
        const favourited: Status = Object.assign(status, {
          favourited: true
        })
        Mentions.mutations![MUTATION_TYPES.UPDATE_TOOT](state, favourited)
        expect(state.mentions[0].status!.favourited).toEqual(true)
        expect(state.mentions[1].status!.favourited).toEqual(true)
      })
    })
  })
})
