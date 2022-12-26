import generator, { Entity, FilterContext } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { LocalMarker } from '~/src/types/localMarker'
import { MyWindow } from '~/src/types/global'
import { LoadingCard } from '@/types/loading-card'

const win = (window as any) as MyWindow

export type HomeState = {
  lazyLoading: boolean
  heading: boolean
  showReblogs: boolean
  showReplies: boolean
  timeline: Array<Entity.Status | LoadingCard>
  unreads: Array<Entity.Status>
}

const state = (): HomeState => ({
  lazyLoading: false,
  heading: true,
  timeline: [],
  showReblogs: true,
  showReplies: true,
  unreads: []
})

export const MUTATION_TYPES = {
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_HEADING: 'changeHeading',
  APPEND_TIMELINE: 'appendTimeline',
  UPDATE_TIMELINE: 'updateTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  ARCHIVE_TIMELINE: 'archiveTimeline',
  CLEAR_TIMELINE: 'clearTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  SHOW_REBLOGS: 'showReblogs',
  SHOW_REPLIES: 'showReplies',
  APPEND_TIMELINE_AFTER_LOADING_CARD: 'appendTimelineAfterLoadingCard',
  MERGE_UNREADS: 'mergeUnreads'
}

const mutations: MutationTree<HomeState> = {
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_TIMELINE]: (state, update: Entity.Status) => {
    // Reject duplicated status in timeline
    if (!state.timeline.find(item => item.id === update.id) && !state.unreads.find(item => item.id === update.id)) {
      if (state.heading) {
        state.timeline = ([update] as Array<Entity.Status | LoadingCard>).concat(state.timeline)
      } else {
        state.unreads = [update].concat(state.unreads)
      }
    }
  },
  [MUTATION_TYPES.UPDATE_TIMELINE]: (state, messages: Array<Entity.Status | LoadingCard>) => {
    state.timeline = messages
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, messages: Array<Entity.Status | LoadingCard>) => {
    state.timeline = state.timeline.concat(messages)
  },
  [MUTATION_TYPES.ARCHIVE_TIMELINE]: state => {
    state.timeline = state.timeline.slice(0, 20)
  },
  [MUTATION_TYPES.CLEAR_TIMELINE]: state => {
    state.timeline = []
    state.unreads = []
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Entity.Status) => {
    // Replace target message in homeTimeline and notifications
    state.timeline = state.timeline.map(status => {
      if (status.id === 'loading-card') {
        return status
      }
      const toot = status as Entity.Status
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
  [MUTATION_TYPES.DELETE_TOOT]: (state, messageId: string) => {
    state.timeline = state.timeline.filter(status => {
      if (status.id === 'loading-card') {
        return true
      }
      const toot = status as Entity.Status
      if (toot.reblog !== null && toot.reblog.id === messageId) {
        return false
      } else {
        return toot.id !== messageId
      }
    })
  },
  [MUTATION_TYPES.SHOW_REBLOGS]: (state, visible: boolean) => {
    state.showReblogs = visible
  },
  [MUTATION_TYPES.SHOW_REPLIES]: (state, visible: boolean) => {
    state.showReplies = visible
  },
  [MUTATION_TYPES.APPEND_TIMELINE_AFTER_LOADING_CARD]: (state, timeline: Array<Entity.Status | LoadingCard>) => {
    const tl = state.timeline.flatMap(status => {
      if (status.id !== 'loading-card') {
        return status
      } else {
        return timeline
      }
    })
    // Reject duplicated status in timeline
    state.timeline = Array.from(new Set(tl))
  },
  [MUTATION_TYPES.MERGE_UNREADS]: state => {
    state.timeline = (state.unreads.slice(0, 80) as Array<Entity.Status | LoadingCard>).concat(state.timeline)
    state.unreads = []
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
  [ACTION_TYPES.FETCH_TIMELINE]: async ({ dispatch, commit, rootState }) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const localMarker: LocalMarker | null = await dispatch('getMarker').catch(err => {
      console.error(err)
    })

    if (rootState.TimelineSpace.timelineSetting.useMarker.home && localMarker !== null) {
      const last = await client.getStatus(localMarker.last_read_id)
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
      commit(MUTATION_TYPES.UPDATE_TIMELINE, timeline)
      return res.data
    } else {
      const res = await client.getHomeTimeline({ limit: 20 })
      commit(MUTATION_TYPES.UPDATE_TIMELINE, res.data)
      return res.data
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
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    return client
      .getHomeTimeline({ max_id: lastStatus.id, limit: 20 })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  },
  [ACTION_TYPES.FETCH_TIMELINE_SINCE]: async ({ state, rootState, commit }, since_id: string): Promise<Array<Entity.Status> | null> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const cardIndex = state.timeline.findIndex(s => {
      if (s.id === 'loading-card') {
        return true
      }
      return false
    })
    let maxID: string | null = null
    if (cardIndex > 0) {
      maxID = state.timeline[cardIndex - 1].id
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
    let params = { min_id: since_id, limit: 20 }
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
      commit(MUTATION_TYPES.APPEND_TIMELINE_AFTER_LOADING_CARD, timeline)
    } else {
      commit(MUTATION_TYPES.APPEND_TIMELINE_AFTER_LOADING_CARD, res.data)
    }
    return res.data
  },
  [ACTION_TYPES.GET_MARKER]: async ({ rootState }): Promise<LocalMarker | null> => {
    if (!rootState.TimelineSpace.timelineSetting.useMarker.home) {
      return null
    }
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    let serverMarker: Entity.Marker | {} = {}
    try {
      const res = await client.getMarkers(['home'])
      serverMarker = res.data
    } catch (err) {
      console.warn(err)
    }
    const s = serverMarker as Entity.Marker
    if (s.home !== undefined) {
      return {
        timeline: 'home',
        last_read_id: s.home.last_read_id
      } as LocalMarker
    }
    const localMarker: LocalMarker | null = await win.ipcRenderer.invoke('get-home-marker', rootState.TimelineSpace.account._id)
    return localMarker
  },
  [ACTION_TYPES.SAVE_MARKER]: async ({ state, rootState }) => {
    const timeline = state.timeline
    if (timeline.length === 0 || timeline[0].id === 'loading-card') {
      return
    }
    win.ipcRenderer.send('save-marker', {
      owner_id: rootState.TimelineSpace.account._id,
      timeline: 'home',
      last_read_id: timeline[0].id
    } as LocalMarker)

    if (rootState.TimelineSpace.sns === 'misskey') {
      return
    }
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
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
