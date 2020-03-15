import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { LoadPositionWithAccount } from '@/types/loadPosition'

export type TimelineState = {
  timeline: Array<Entity.Status>
  pinnedToots: Array<Entity.Status>
  lazyLoading: boolean
}

const state = (): TimelineState => ({
  timeline: [],
  pinnedToots: [],
  lazyLoading: false
})

export const MUTATION_TYPES = {
  UPDATE_TIMELINE: 'updateTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  UPDATE_PINNED_TOOTS: 'updatePinnedToots',
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  UPDATE_PINNED_TOOT: 'updatePinnedToot',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot'
}

const mutations: MutationTree<TimelineState> = {
  [MUTATION_TYPES.UPDATE_TIMELINE]: (state, timeline: Array<Entity.Status>) => {
    state.timeline = timeline
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, messages: Array<Entity.Status>) => {
    state.timeline = state.timeline.concat(messages)
  },
  [MUTATION_TYPES.UPDATE_PINNED_TOOTS]: (state, messages: Array<Entity.Status>) => {
    state.pinnedToots = messages
  },
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.UPDATE_PINNED_TOOT]: (state, message: Entity.Status) => {
    state.pinnedToots = state.pinnedToots.map(toot => {
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
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Entity.Status) => {
    // Replace target message in timeline
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
  [MUTATION_TYPES.DELETE_TOOT]: (state, message: Entity.Status) => {
    state.timeline = state.timeline.filter(toot => {
      if (toot.reblog !== null && toot.reblog.id === message.id) {
        return false
      } else {
        return toot.id !== message.id
      }
    })
  }
}

const actions: ActionTree<TimelineState, RootState> = {
  fetchTimeline: async ({ commit, rootState }, account: Account) => {
    commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true, { root: true })
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const pinned = await client.getAccountStatuses(account.id, { pinned: true, limit: 10 })
    commit(MUTATION_TYPES.UPDATE_PINNED_TOOTS, pinned.data)
    const res = await client.getAccountStatuses(account.id, { limit: 40, pinned: false })
    commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
    commit(MUTATION_TYPES.UPDATE_TIMELINE, res.data)
    return res.data
  },
  lazyFetchTimeline: async ({ state, commit, rootState }, loadPosition: LoadPositionWithAccount): Promise<null> => {
    if (state.lazyLoading) {
      return Promise.resolve(null)
    }
    commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, true)
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    try {
      const res = await client.getAccountStatuses(loadPosition.account.id, {
        max_id: loadPosition.status.id,
        limit: 40,
        pinned: false
      })
      commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
    } finally {
      commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
    }
    return null
  },
  clearTimeline: ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_TIMELINE, [])
  }
}

const Timeline: Module<TimelineState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Timeline
