import generator, { Entity, NotificationType } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'

const excludes: Array<string> = [
  NotificationType.Follow,
  NotificationType.Favourite,
  NotificationType.Reblog,
  NotificationType.PollVote,
  NotificationType.PollExpired,
  NotificationType.EmojiReaction
]

export type MentionsState = {
  lazyLoading: boolean
  heading: boolean
  mentions: Array<Entity.Notification>
}

const state = (): MentionsState => ({
  lazyLoading: false,
  heading: true,
  mentions: []
})

export const MUTATION_TYPES = {
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_HEADING: 'changeHeading',
  APPEND_MENTIONS: 'appendMentions',
  UPDATE_MENTIONS: 'updateMentions',
  INSERT_MENTIONS: 'insertMentions',
  ARCHIVE_MENTIONS: 'archiveMentions',
  CLEAR_MENTIONS: 'clearMentions',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot'
}

const mutations: MutationTree<MentionsState> = {
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_MENTIONS]: (state, update: Entity.Notification) => {
    // Reject duplicated status in timeline
    if (!state.mentions.find(item => item.id === update.id)) {
      state.mentions = [update].concat(state.mentions)
    }
  },
  [MUTATION_TYPES.UPDATE_MENTIONS]: (state, messages: Array<Entity.Notification>) => {
    state.mentions = messages
  },
  [MUTATION_TYPES.INSERT_MENTIONS]: (state, messages: Array<Entity.Notification>) => {
    state.mentions = state.mentions.concat(messages)
  },
  [MUTATION_TYPES.ARCHIVE_MENTIONS]: state => {
    state.mentions = state.mentions.slice(0, 30)
  },
  [MUTATION_TYPES.CLEAR_MENTIONS]: state => {
    state.mentions = []
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Entity.Status) => {
    state.mentions = state.mentions.map(mention => {
      if (mention.type === 'mention' && mention.status && mention.status.id === message.id) {
        const status = {
          status: message
        }
        return Object.assign(mention, status)
      } else {
        return mention
      }
    })
  },
  [MUTATION_TYPES.DELETE_TOOT]: (state, id: string) => {
    state.mentions = state.mentions.filter(m => {
      if (m.id === 'loading-card') {
        return true
      }
      const mention = m as Entity.Notification
      if (mention.status) {
        if (mention.status.reblog && mention.status.reblog.id === id) {
          return false
        } else {
          return mention.status.id !== id
        }
      } else {
        return true
      }
    })
  }
}

export const ACTION_TYPES = {
  FETCH_MENTIONS: 'fetchMentions',
  LAZY_FETCH_MENTIONS: 'lazyFetchMentions'
}

const actions: ActionTree<MentionsState, RootState> = {
  [ACTION_TYPES.FETCH_MENTIONS]: async ({ commit, rootState }): Promise<Array<Entity.Notification>> => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )

    const res = await client.getNotifications({
      limit: 30,
      exclude_types: excludes
    })
    commit(MUTATION_TYPES.UPDATE_MENTIONS, res.data)
    return res.data
  },
  [ACTION_TYPES.LAZY_FETCH_MENTIONS]: async (
    { state, commit, rootState },
    lastMention: Entity.Notification
  ): Promise<Array<Entity.Notification> | null> => {
    if (state.lazyLoading) {
      return Promise.resolve(null)
    }
    commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, true)
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    return client
      .getNotifications({
        max_id: lastMention.id,
        limit: 30,
        exclude_types: excludes
      })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_MENTIONS, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  }
}

const getters: GetterTree<MentionsState, RootState> = {
  mentions: state => {
    return state.mentions.filter(mention => {
      switch (mention.type) {
        case 'middle-load':
        case NotificationType.Mention:
          return true
        default:
          return false
      }
    })
  }
}

const Mentions: Module<MentionsState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

export default Mentions
