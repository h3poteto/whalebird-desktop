import generator, { Entity, FilterContext } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'

export type PublicState = {
  timeline: Array<Entity.Status>
  lazyLoading: boolean
  heading: boolean
}

const state = (): PublicState => ({
  timeline: [],
  lazyLoading: false,
  heading: true
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
  CHANGE_LAZY_LOADING: 'changeLazyLoading'
}

const mutations: MutationTree<PublicState> = {
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_TIMELINE]: (state, update: Entity.Status) => {
    // Reject duplicated status in timeline
    if (!state.timeline.find(item => item.id === update.id)) {
      state.timeline = [update].concat(state.timeline)
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
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Entity.Status) => {
    state.timeline = state.timeline.map(toot => {
      if (toot.id === message.id) {
        return message
      } else if (toot.reblog && toot.reblog.id === message.id) {
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
  }
}

const actions: ActionTree<PublicState, RootState> = {
  fetchPublicTimeline: async ({ dispatch, commit, rootState }): Promise<Array<Entity.Status>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    try {
      const res = await client.getPublicTimeline({ limit: 40 })
      commit(MUTATION_TYPES.UPDATE_TIMELINE, res.data)
      return res.data
    } catch (err) {
      // Disable public timeline
      dispatch('TimelineSpace/SideMenu/disablePublic', {}, { root: true })
      return []
    }
  },
  lazyFetchTimeline: ({ state, commit, rootState }, lastStatus: Entity.Status): Promise<Array<Entity.Status> | null> => {
    if (state.lazyLoading) {
      return Promise.resolve(null)
    }
    commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, true)
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    return client
      .getPublicTimeline({ max_id: lastStatus.id, limit: 40 })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  }
}

const getters: GetterTree<PublicState, RootState> = {
  filters: (_state, _getters, rootState) => {
    return rootState.TimelineSpace.filters.filter(f => f.context.includes(FilterContext.Public) && !f.irreversible)
  }
}

const Public: Module<PublicState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

export default Public
