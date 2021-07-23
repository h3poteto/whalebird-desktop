import generator, { Entity, FilterContext } from 'megalodon'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import { LocalMarker } from '~/src/types/localMarker'
import { MyWindow } from '~/src/types/global'
import { LoadingCard } from '~/src/types/loadingCard'

const win = (window as any) as MyWindow

export type HomeState = {
  lazyLoading: boolean
  heading: boolean
  showReblogs: boolean
  showReplies: boolean
  timeline: Array<Entity.Status | LoadingCard>
  unreadTimeline: Array<Entity.Status>
}

const state = (): HomeState => ({
  lazyLoading: false,
  heading: true,
  timeline: [],
  unreadTimeline: [],
  showReblogs: true,
  showReplies: true
})

export const MUTATION_TYPES = {
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_HEADING: 'changeHeading',
  APPEND_STATUS: 'appendStatus',
  UPDATE_TIMELINE: 'updateTimeline',
  MERGE_TIMELINE: 'mergeTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  ARCHIVE_TIMELINE: 'archiveTimeline',
  CLEAR_TIMELINE: 'clearTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  SHOW_REBLOGS: 'showReblogs',
  SHOW_REPLIES: 'showReplies',
  APPEND_TIMELINE_AFTER_LOADING_CARD: 'appendTimelineAfterLoadingCard'
}

const mutations: MutationTree<HomeState> = {
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, value: boolean) => {
    state.lazyLoading = value
  },
  [MUTATION_TYPES.CHANGE_HEADING]: (state, value: boolean) => {
    state.heading = value
  },
  [MUTATION_TYPES.APPEND_STATUS]: (state, update: Entity.Status) => {
    // Reject duplicated status in timeline
    if (!state.timeline.find(item => item.id === update.id) && !state.unreadTimeline.find(item => item.id === update.id)) {
      if (state.heading && state.timeline[0].id !== 'loading-card') {
        // TODO: これをやるならheadに戻ってきたときのmergeもloading-card条件を付けたい
        state.timeline = ([update] as Array<Entity.Status | LoadingCard>).concat(state.timeline)
      } else {
        state.unreadTimeline = [update].concat(state.unreadTimeline)
      }
    }
  },
  [MUTATION_TYPES.UPDATE_TIMELINE]: (state, messages: Array<Entity.Status | LoadingCard>) => {
    state.timeline = messages
  },
  [MUTATION_TYPES.MERGE_TIMELINE]: state => {
    state.timeline = (state.unreadTimeline.slice(0, 80) as Array<Entity.Status | LoadingCard>).concat(state.timeline)
    state.unreadTimeline = []
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, messages: Array<Entity.Status>) => {
    state.timeline = state.timeline.concat(messages)
  },
  [MUTATION_TYPES.ARCHIVE_TIMELINE]: state => {
    state.timeline = state.timeline.slice(0, 40)
  },
  [MUTATION_TYPES.CLEAR_TIMELINE]: state => {
    state.timeline = []
    state.unreadTimeline = []
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
    const statuses = state.timeline.filter(status => status.id !== 'loading-card')
    state.timeline = timeline.concat(statuses)
    // const loadingCardIndex = state.timeline.findIndex(status => status.id === 'loading-card')
    // if (loadingCardIndex === -1) {
    //   return
    // }
    // const latest = state.timeline.slice(0, loadingCardIndex)
    // const old = state.timeline.slice(loadingCardIndex + 1)
    // state.timeline = latest.concat(timeline).concat(old)
  }
}

const actions: ActionTree<HomeState, RootState> = {
  fetchTimeline: async ({ commit, rootState, dispatch }) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const localMarker: LocalMarker | null = await dispatch('getMarker').catch(err => {
      console.error(err)
    })
    let params = { limit: 40 }
    if (localMarker !== null) {
      params = Object.assign({}, params, {
        max_id: localMarker.last_read_id
      })
    }

    const res = await client.getHomeTimeline(params)
    let timeline: Array<Entity.Status | LoadingCard> = []
    if (res.data.length > 0) {
      const card: LoadingCard = {
        type: 'middle-load',
        since_id: res.data[0].id,
        max_id: null,
        id: 'loading-card'
      }
      timeline = timeline.concat([card])
    }
    timeline = timeline.concat(res.data)
    commit(MUTATION_TYPES.UPDATE_TIMELINE, timeline)
    return res.data
  },
  lazyFetchTimeline: async ({ state, commit, rootState }, lastStatus: Entity.Status): Promise<Array<Entity.Status> | null> => {
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
      .getHomeTimeline({ max_id: lastStatus.id, limit: 40 })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  },
  fetchTimelineSince: async ({ commit, rootState }, since_id: string): Promise<Array<Entity.Status> | null> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )

    // TODO: これのappendは上手く行ってるっぽく見えるのだが，問題は表示だ
    // dynamic scrollerに噛ませると，かつてloadingcardがあった部分に無駄なスペースが発生している
    // しかも，そこには本来statusが表示されているっぽいので，完全になにかレンダリング上の問題が発生している
    // あとscroll positionを変えずにやりたい
    // TODO: fedibirdでロードできてないんだけど？ <- saveされてるmarkerに問題がありそう
    //
    const res = await client.getHomeTimeline({ min_id: since_id, limit: 40 })
    if (res.data.length >= 40) {
      const card: LoadingCard = {
        type: 'middle-load',
        since_id: res.data[0].id,
        max_id: null,
        id: 'loading-card'
      }
      let timeline: Array<Entity.Status | LoadingCard> = [card]
      timeline = timeline.concat(res.data)
      commit(MUTATION_TYPES.APPEND_TIMELINE_AFTER_LOADING_CARD, timeline)
    } else {
      commit(MUTATION_TYPES.APPEND_TIMELINE_AFTER_LOADING_CARD, res.data)
    }
    return res.data
  },
  getMarker: async ({ rootState }): Promise<LocalMarker | null> => {
    if (!rootState.App.useMarker) {
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
    if ((serverMarker as Entity.Marker).home !== undefined) {
      return {
        timeline: 'home',
        last_read_id: (serverMarker as Entity.Marker).home.last_read_id
      } as LocalMarker
    }
    const localMarker: LocalMarker | null = await win.ipcRenderer.invoke('get-home-marker', rootState.TimelineSpace.account._id)
    return localMarker
  },
  saveMarker: async ({ state, rootState }) => {
    // if (!state.heading) {
    //   return
    // }
    const timeline = state.timeline.filter(status => status.id !== 'loading-card')
    if (timeline.length === 0) {
      return
    }
    await win.ipcRenderer.invoke('save-marker', {
      owner_id: rootState.TimelineSpace.account._id,
      timeline: 'home',
      last_read_id: timeline[0].id
    } as LocalMarker)
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
