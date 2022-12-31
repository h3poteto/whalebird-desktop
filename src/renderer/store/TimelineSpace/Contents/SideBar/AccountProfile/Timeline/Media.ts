import { RootState } from '@/store'
import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { LoadPositionWithAccount } from '@/types/loadPosition'

export type MediaState = {
  timeline: Array<Entity.Status>
  lazyLoading: boolean
}

const state = (): MediaState => ({
  timeline: [],
  lazyLoading: false
})

export const MUTATION_TYPES = {
  UPDATE_TIMELINE: 'updateTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot'
}

const mutations: MutationTree<MediaState> = {
  [MUTATION_TYPES.UPDATE_TIMELINE]: (state, timeline: Array<Entity.Status>) => {
    state.timeline = timeline
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, message: Array<Entity.Status>) => {
    state.timeline = state.timeline.concat(message)
  },
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
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

export const ACTION_TYPES = {
  FETCH_TIMELINE: 'fetchTimeline',
  LAZY_FETCH_TIMELINE: 'lazyFetchTimeline',
  CLEAR_TIMELINE: 'clearTimeline'
}

const actions: ActionTree<MediaState, RootState> = {
  [ACTION_TYPES.FETCH_TIMELINE]: async ({ commit, rootState }, account: Entity.Account) => {
    commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true, { root: true })
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    const res = await client.getAccountStatuses(account.id, { limit: 40, pinned: false, only_media: true })
    commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false, { root: true })
    commit(MUTATION_TYPES.UPDATE_TIMELINE, res.data)
    return res.data
  },
  [ACTION_TYPES.LAZY_FETCH_TIMELINE]: async ({ state, commit, rootState }, loadPosition: LoadPositionWithAccount): Promise<null> => {
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
    try {
      const res = await client.getAccountStatuses(loadPosition.account.id, {
        max_id: loadPosition.status.id,
        limit: 40,
        pinned: false,
        only_media: true
      })
      commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
    } finally {
      commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
    }
    return null
  },
  [ACTION_TYPES.CLEAR_TIMELINE]: ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_TIMELINE, [])
  }
}

const Media: Module<MediaState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Media
