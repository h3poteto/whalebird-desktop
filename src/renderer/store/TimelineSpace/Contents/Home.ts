import generator, { Entity, FilterContext } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { LoadingCard } from '@/types/loading-card'
import { LocalServer } from '~/src/types/localServer'
import { LocalAccount } from '~/src/types/localAccount'

export type HomeState = {
  timeline: { [key: number]: Array<Entity.Status | LoadingCard> }
}

const state = (): HomeState => ({
  timeline: {}
})

export const MUTATION_TYPES = {
  APPEND_TIMELINE: 'appendTimeline',
  REPLACE_TIMELINE: 'replaceTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  APPEND_TIMELINE_AFTER_LOADING_CARD: 'appendTimelineAfterLoadingCard'
}

const mutations: MutationTree<HomeState> = {
  [MUTATION_TYPES.APPEND_TIMELINE]: (state, obj: { status: Entity.Status; accountId: number }) => {
    if (state.timeline[obj.accountId]) {
      state.timeline[obj.accountId] = [obj.status, ...state.timeline[obj.accountId]]
    } else {
      state.timeline[obj.accountId] = [obj.status]
    }
  },
  [MUTATION_TYPES.REPLACE_TIMELINE]: (state, obj: { statuses: Array<Entity.Status | LoadingCard>; accountId: number }) => {
    state.timeline[obj.accountId] = obj.statuses
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, obj: { statuses: Array<Entity.Status | LoadingCard>; accountId: number }) => {
    if (state.timeline[obj.accountId]) {
      state.timeline[obj.accountId] = [...state.timeline[obj.accountId], ...obj.statuses]
    } else {
      state.timeline[obj.accountId] = obj.statuses
    }
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, obj: { status: Entity.Status; accountId: number }) => {
    if (!state.timeline[obj.accountId]) return
    // Replace target message in homeTimeline and notifications
    state.timeline[obj.accountId] = state.timeline[obj.accountId].map(status => {
      if (status.id === 'loading-card') {
        return status
      }
      const toot = status as Entity.Status
      if (toot.id === obj.status.id) {
        return obj.status
      } else if (toot.reblog !== null && toot.reblog.id === obj.status.id) {
        // When user reblog/favourite a reblogged toot, target message is a original toot.
        // So, a message which is received now is original toot.
        const reblog = {
          reblog: obj.status
        }
        return Object.assign(toot, reblog)
      } else {
        return toot
      }
    })
  },
  [MUTATION_TYPES.DELETE_TOOT]: (state, obj: { statusId: string; accountId: number }) => {
    if (!state.timeline[obj.accountId]) return
    state.timeline[obj.accountId] = state.timeline[obj.accountId].filter(status => {
      if (status.id === 'loading-card') {
        return true
      }
      const toot = status as Entity.Status
      if (toot.reblog !== null && toot.reblog.id === obj.statusId) {
        return false
      } else {
        return toot.id !== obj.statusId
      }
    })
  },
  [MUTATION_TYPES.APPEND_TIMELINE_AFTER_LOADING_CARD]: (
    state,
    obj: { statuses: Array<Entity.Status | LoadingCard>; accountId: number }
  ) => {
    if (!state.timeline[obj.accountId]) return
    const tl = state.timeline[obj.accountId].flatMap(status => {
      if (status.id !== 'loading-card') {
        return status
      } else {
        return obj.statuses
      }
    })
    // Reject duplicated status in timeline
    state.timeline[obj.accountId] = Array.from(new Set(tl))
  }
}

export const ACTION_TYPES = {
  FETCH_TIMELINE: 'fetchTimeline',
  LAZY_FETCH_TIMELINE: 'lazyFetchTimeline',
  FETCH_TIMELINE_SINCE: 'fetchTimelineSince',
  GET_MARKER: 'getMarker',
  SAVE_MARKER: 'saveMarker'
}

const actions: ActionTree<HomeState, RootState> = {
  // vue
  [ACTION_TYPES.FETCH_TIMELINE]: async ({ dispatch, commit, rootState }, req: { account: LocalAccount; server: LocalServer }) => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const marker: Entity.Marker | null = await dispatch(ACTION_TYPES.GET_MARKER, req).catch(err => {
      console.error(err)
    })

    if (rootState.TimelineSpace.setting.markerHome && marker !== null && marker.home) {
      const last = await client.getStatus(marker.home.last_read_id)
      const lastReadStatus = last.data

      let timeline: Array<Entity.Status | LoadingCard> = [lastReadStatus]
      const card: LoadingCard = {
        type: 'middle-load',
        since_id: lastReadStatus.id,
        // We don't need to fill this field in the first fetching.
        // Because in most cases there is no new statuses at the first fetching.
        // After new statuses are received, if the number of unread statuses is more than 20, max_id is not necessary.
        // We can fill max_id when calling fetchTimelineSince.
        // If the number of unread statuses is less than 20, max_id is necessary, but it is enough to reject duplicated statuses.
        // So we do it in mutation.
        max_id: null,
        id: 'loading-card',
        uri: 'loading-card'
      }

      const res = await client.getHomeTimeline({ limit: 20, max_id: lastReadStatus.id })
      // Make sure whether new statuses exist or not.
      const nextResponse = await client.getHomeTimeline({ limit: 1, min_id: lastReadStatus.id })
      if (nextResponse.data.length > 0) {
        timeline = ([card] as Array<Entity.Status | LoadingCard>).concat(timeline).concat(res.data)
      } else {
        timeline = timeline.concat(res.data)
      }
      commit(MUTATION_TYPES.REPLACE_TIMELINE, { statuses: timeline, accountId: req.account.id })
      return res.data
    } else {
      const res = await client.getHomeTimeline({ limit: 20 })
      commit(MUTATION_TYPES.REPLACE_TIMELINE, { statuses: res.data, accountId: req.account.id })
      return res.data
    }
  },
  [ACTION_TYPES.LAZY_FETCH_TIMELINE]: async (
    { commit, rootState },
    req: { lastStatus: Entity.Status; account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Status> | null> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    return client.getHomeTimeline({ max_id: req.lastStatus.id, limit: 20 }).then(res => {
      commit(MUTATION_TYPES.INSERT_TIMELINE, { statuses: res.data, accountId: req.account.id })
      return res.data
    })
  },
  [ACTION_TYPES.FETCH_TIMELINE_SINCE]: async (
    { state, rootState, commit },
    req: { sinceId: string; account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Status> | null> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const cardIndex = state.timeline[req.account.id].findIndex(s => {
      if (s.id === 'loading-card') {
        return true
      }
      return false
    })
    let maxID: string | null = null
    if (cardIndex > 0) {
      maxID = state.timeline[req.account.id][cardIndex - 1].id
    }
    // Memo: What happens when we specify both of max_id and min_id?
    // What is the difference between max_id & since_id and max_id & min_id?
    // The max_id & since_id:
    // We can get statuses which are older than max_id and newer than since_id.
    // If the number of statuses exceeds the limit, it truncates older statuses.
    // That means, the status immediately after since_id is not included in the response.
    // The max_id & min_id:
    // Also, we can get statuses which are older than max_id and newer than min_id.
    // If the number of statuses exceeds the limit, it truncates newer statuses.
    // That means, the status immediately before max_id is not included in the response.
    let params = { min_id: req.sinceId, limit: 20 }
    if (maxID !== null) {
      params = Object.assign({}, params, {
        max_id: maxID
      })
    }

    const res = await client.getHomeTimeline(params)
    if (res.data.length >= 20) {
      const card: LoadingCard = {
        type: 'middle-load',
        since_id: res.data[0].id,
        max_id: maxID,
        id: 'loading-card',
        uri: 'loading-card'
      }
      let timeline: Array<Entity.Status | LoadingCard> = [card]
      timeline = timeline.concat(res.data)
      commit(MUTATION_TYPES.APPEND_TIMELINE_AFTER_LOADING_CARD, { statuses: timeline, accountId: req.account.id })
    } else {
      commit(MUTATION_TYPES.APPEND_TIMELINE_AFTER_LOADING_CARD, { statuses: res.data, accountId: req.account.id })
    }
    return res.data
  },
  [ACTION_TYPES.GET_MARKER]: async ({ rootState }, req: { account: LocalAccount; server: LocalServer }): Promise<Entity.Marker | null> => {
    if (!rootState.TimelineSpace.setting.markerHome) {
      return null
    }
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    let serverMarker: Entity.Marker | {} = {}
    try {
      const res = await client.getMarkers(['home'])
      serverMarker = res.data
    } catch (err) {
      console.warn(err)
    }
    return serverMarker
  },
  [ACTION_TYPES.SAVE_MARKER]: async ({ state, rootState }, req: { account: LocalAccount; server: LocalServer }) => {
    const timeline = state.timeline[req.account.id]
    if (timeline.length === 0 || timeline[0].id === 'loading-card') {
      return
    }
    if (req.server.sns === 'misskey') {
      return
    }
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const res = await client.saveMarkers({ home: { last_read_id: timeline[0].id } })
    return res.data
  }
}

const getters: GetterTree<HomeState, RootState> = {
  filters: (_state, _getters, rootState) => {
    return rootState.TimelineSpace.filters.filter(f => f.context.includes(FilterContext.Home) && !f.irreversible)
  }
}

const Home: Module<HomeState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

export default Home
