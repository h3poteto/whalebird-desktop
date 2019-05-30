import Mastodon, { Notification, Response } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'

export interface MentionsState {
  lazyLoading: boolean
  heading: boolean
  mentions: Array<Notification>
  unreadMentions: Array<Notification>
  filter: string
}

const state = (): MentionsState => ({
  lazyLoading: false,
  heading: true,
  mentions: [],
  unreadMentions: [],
  filter: ''
})

export const MUTATION_TYPES = {
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_HEADING: 'changeHeading',
  APPEND_MENTIONS: 'appendMentions',
  UPDATE_MENTIONS: 'updateMentions',
  MERGE_MENTIONS: 'mergeMentions',
  INSERT_MENTIONS: 'insertMentions',
  ARCHIVE_MENTIONS: 'archiveMentions',
  CLEAR_MENTIONS: 'clearMentions',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  CHANGE_FILTER: 'changeFilter'
}

const mutations: MutationTree<MentionsState> = {
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_MENTIONS]: (state, update: Notification) => {
    if (state.heading) {
      state.mentions = [update].concat(state.mentions)
    } else {
      state.unreadMentions = [update].concat(state.unreadMentions)
    }
  },
  [MUTATION_TYPES.UPDATE_MENTIONS]: (state, messages: Array<Notification>) => {
    state.mentions = messages
  },
  [MUTATION_TYPES.MERGE_MENTIONS]: state => {
    state.mentions = state.unreadMentions.slice(0, 80).concat(state.mentions)
    state.unreadMentions = []
  },
  [MUTATION_TYPES.INSERT_MENTIONS]: (state, messages: Array<Notification>) => {
    state.mentions = state.mentions.concat(messages)
  },
  [MUTATION_TYPES.ARCHIVE_MENTIONS]: state => {
    state.mentions = state.mentions.slice(0, 40)
  },
  [MUTATION_TYPES.CLEAR_MENTIONS]: state => {
    state.mentions = []
    state.unreadMentions = []
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Notification) => {
    state.mentions = state.mentions.map(mention => {
      if (mention.status !== null && mention.status.id === message.id) {
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
    state.mentions = state.mentions.filter(mention => {
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
  },
  [MUTATION_TYPES.CHANGE_FILTER]: (state, filter: string) => {
    state.filter = filter
  }
}

const actions: ActionTree<MentionsState, RootState> = {
  fetchMentions: async ({ commit, rootState }): Promise<Array<Notification>> => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Array<Notification>> = await client.get<Array<Notification>>('/notifications', {
      limit: 30,
      exclude_types: ['follow', 'favourite', 'reblog']
    })
    commit(MUTATION_TYPES.UPDATE_MENTIONS, res.data)
    return res.data
  },
  lazyFetchMentions: async ({ state, commit, rootState }, lastMention: Notification): Promise<Array<Notification> | null> => {
    if (state.lazyLoading) {
      return Promise.resolve(null)
    }
    commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, true)
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    return client
      .get<Array<Notification>>('/notifications', { max_id: lastMention.id, limit: 30, exclude_types: ['follow', 'favourite', 'reblog'] })
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
    return state.mentions.filter(mention => mention.type === 'mention')
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
