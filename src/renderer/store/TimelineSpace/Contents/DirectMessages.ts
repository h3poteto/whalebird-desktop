import Mastodon, { Status, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface DirectMessagesState {
  lazyLoading: boolean,
  heading: boolean,
  timeline: Array<Status>,
  unreadTimeline: Array<Status>,
  filter: string
}

const state = (): DirectMessagesState => ({
  lazyLoading: false,
  heading: true,
  timeline: [],
  unreadTimeline: [],
  filter: ''
})

export const MUTATION_TYPES = {
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_HEADING: 'changeHeading',
  APPEND_TIMELINE: 'appendTimeline',
  UPDATE_TIMELINE: 'updateTimeline',
  MERGE_TIMELINE: 'mergeTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  ARCHIVE_TIMELINE: 'archiveTimeline',
  CLEAR_TIMELINE: 'clearTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  CHANGE_FILTER: 'changeFilter'
}

const mutations: MutationTree<DirectMessagesState> = {
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_TIMELINE]: (state, update: Status) => {
    if (state.heading) {
      state.timeline = [update].concat(state.timeline)
    } else {
      state.unreadTimeline = [update].concat(state.unreadTimeline)
    }
  },
  [MUTATION_TYPES.UPDATE_TIMELINE]: (state, messages: Array<Status>) => {
    state.timeline = messages
  },
  [MUTATION_TYPES.MERGE_TIMELINE]: (state) => {
    state.timeline = state.unreadTimeline.slice(0, 80).concat(state.timeline)
    state.unreadTimeline = []
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, messages: Array<Status>) => {
    state.timeline = state.timeline.concat(messages)
  },
  [MUTATION_TYPES.ARCHIVE_TIMELINE]: (state) => {
    state.timeline = state.timeline.slice(0, 40)
  },
  [MUTATION_TYPES.CLEAR_TIMELINE]: (state) => {
    state.timeline = []
    state.unreadTimeline = []
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Status) => {
    // Replace target message in DirectMessagesTimeline and notifications
    state.timeline = state.timeline.map((toot) => {
      if (toot.id === message.id) {
        return message
      } else if (toot.reblog !== null && toot.reblog.id === message.id) {
        // When user reblog/favourite a reblogged toot, target message is a original toot.
        // So, a message which is received now is original toot.
        const reblog = {
          reblog: message
        }
        return Object.assign(toot, reblog)
      } else {
        return toot
      }
    })
  },
  [MUTATION_TYPES.DELETE_TOOT]: (state, message: Status) => {
    state.timeline = state.timeline.filter((toot) => {
      if (toot.reblog !== null && toot.reblog.id === message.id) {
        return false
      } else {
        return toot.id !== message.id
      }
    })
  },
  [MUTATION_TYPES.CHANGE_FILTER]: (state, filter: string) => {
    state.filter = filter
  }
}

const actions: ActionTree<DirectMessagesState, RootState> = {
  fetchTimeline: async ({ commit, rootState }): Promise<Array<Status>> => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res: Response<Array<Status>> = await client.get<Array<Status>>('/timelines/direct', { limit: 40 })

    commit(MUTATION_TYPES.UPDATE_TIMELINE, res.data)
    return res.data
  },
  lazyFetchTimeline: ({ state, commit, rootState }, lastStatus: Status): Promise<Array<Status> | null> => {
    if (state.lazyLoading) {
      return Promise.resolve(null)
    }
    commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, true)
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    return client.get<Array<Status>>('/timelines/direct', { max_id: lastStatus.id, limit: 40 })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  }
}

const DirectMessages: Module<DirectMessagesState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default DirectMessages
