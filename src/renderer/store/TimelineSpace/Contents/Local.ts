import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type LocalState = {
  timeline: Array<Entity.Status>
  lazyLoading: boolean
  heading: boolean
  unreads: Array<Entity.Status>
}

const state = (): LocalState => ({
  timeline: [],
  lazyLoading: false,
  heading: true,
  unreads: []
})

export const MUTATION_TYPES = {
  CHANGE_HEADING: 'changeHeading',
  APPEND_TIMELINE: 'appendTimeline',
  UPDATE_TIMELINE: 'updateTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  ARCHIVE_TIMELINE: 'archiveTimeline',
  CLEAR_TIMELINE: 'clearTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  MERGE_UNREADS: 'mergeUnreads'
}

const mutations: MutationTree<LocalState> = {
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_TIMELINE]: (state, update: Entity.Status) => {
    // Reject duplicated status in timeline
    if (!state.timeline.find(item => item.id === update.id) && !state.unreads.find(item => item.id === update.id)) {
      if (state.heading) {
        state.timeline = [update].concat(state.timeline)
      } else {
        state.unreads = [update].concat(state.unreads)
      }
    }
  },
  [MUTATION_TYPES.UPDATE_TIMELINE]: (state, messages: Array<Entity.Status>) => {
    state.timeline = messages
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, messages: Array<Entity.Status>) => {
    state.timeline = state.timeline.concat(messages)
  },
  [MUTATION_TYPES.ARCHIVE_TIMELINE]: state => {
    state.timeline = state.timeline.slice(0, 40)
  },
  [MUTATION_TYPES.CLEAR_TIMELINE]: state => {
    state.timeline = []
    state.unreads = []
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Entity.Status) => {
    state.timeline = state.timeline.map(toot => {
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
  [MUTATION_TYPES.DELETE_TOOT]: (state, id: string) => {
    state.timeline = state.timeline.filter(toot => {
      if (toot.reblog !== null && toot.reblog.id === id) {
        return false
      } else {
        return toot.id !== id
      }
    })
  },
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.MERGE_UNREADS]: state => {
    state.timeline = state.unreads.slice(0, 80).concat(state.timeline)
    state.unreads = []
  }
}

export const ACTION_TYPES = {
  FETCH_LOCAL_TIMELINE: 'fetchLocalTimeline',
  LAZY_FETCH_TIMELINE: 'lazyFetchTimeline'
}

const actions: ActionTree<LocalState, RootState> = {
  [ACTION_TYPES.FETCH_LOCAL_TIMELINE]: async ({ commit, rootState }): Promise<Array<Entity.Status>> => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )

    try {
      const res = await client.getLocalTimeline({ limit: 20 })
      commit(MUTATION_TYPES.UPDATE_TIMELINE, res.data)
      return res.data
    } catch (err) {
      return []
    }
  },
  [ACTION_TYPES.LAZY_FETCH_TIMELINE]: async (
    { state, commit, rootState },
    lastStatus: Entity.Status
  ): Promise<Array<Entity.Status> | null> => {
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
      .getLocalTimeline({ max_id: lastStatus.id, limit: 20 })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  }
}

const Local: Module<LocalState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Local
