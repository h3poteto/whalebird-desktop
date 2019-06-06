import { ipcRenderer } from 'electron'
import Mastodon, { Status, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { LoadPositionWithList } from '@/types/loadPosition'

export type ShowState = {
  timeline: Array<Status>
  unreadTimeline: Array<Status>
  lazyLoading: boolean
  heading: boolean
  filter: string
}

const state = (): ShowState => ({
  timeline: [],
  unreadTimeline: [],
  lazyLoading: false,
  heading: true,
  filter: ''
})

export const MUTATION_TYPES = {
  CHANGE_HEADING: 'changeHeading',
  APPEND_TIMELINE: 'appendTimeline',
  UPDATE_TIMELINE: 'updateTimeline',
  MERGE_TIMELINE: 'mergeTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  ARCHIVE_TIMELINE: 'archiveTimeline',
  CLEAR_TIMELINE: 'clearTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot',
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_FILTER: 'changeFilter'
}

const mutations: MutationTree<ShowState> = {
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
  [MUTATION_TYPES.UPDATE_TIMELINE]: (state, timeline: Array<Status>) => {
    state.timeline = timeline
  },
  [MUTATION_TYPES.MERGE_TIMELINE]: state => {
    state.timeline = state.unreadTimeline.slice(0, 80).concat(state.timeline)
    state.unreadTimeline = []
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, messages: Array<Status>) => {
    state.timeline = state.timeline.concat(messages)
  },
  [MUTATION_TYPES.ARCHIVE_TIMELINE]: state => {
    state.timeline = state.timeline.slice(0, 40)
  },
  [MUTATION_TYPES.CLEAR_TIMELINE]: state => {
    state.timeline = []
    state.unreadTimeline = []
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, message: Status) => {
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
  [MUTATION_TYPES.CHANGE_FILTER]: (state, filter: string) => {
    state.filter = filter
  }
}

const actions: ActionTree<ShowState, RootState> = {
  fetchTimeline: async ({ commit, rootState }, listID: string): Promise<Array<Status>> => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Array<Status>> = await client.get<Array<Status>>(`/timelines/list/${listID}`, { limit: 40 })
    commit(MUTATION_TYPES.UPDATE_TIMELINE, res.data)
    return res.data
  },
  startStreaming: ({ state, commit, rootState }, listID: string) => {
    ipcRenderer.on('update-start-list-streaming', (_, update: Status) => {
      commit(MUTATION_TYPES.APPEND_TIMELINE, update)
      if (state.heading && Math.random() > 0.8) {
        commit(MUTATION_TYPES.ARCHIVE_TIMELINE)
      }
    })
    ipcRenderer.on('delete-start-list-streaming', (_, id: string) => {
      commit(MUTATION_TYPES.DELETE_TOOT, id)
    })
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      ipcRenderer.send('start-list-streaming', {
        listID: listID,
        account: rootState.TimelineSpace.account,
        useWebsocket: rootState.TimelineSpace.useWebsocket
      })
      ipcRenderer.once('error-start-list-streaming', (_, err: Error) => {
        reject(err)
      })
    })
  },
  stopStreaming: () => {
    return new Promise(resolve => {
      ipcRenderer.removeAllListeners('error-start-list-streaming')
      ipcRenderer.removeAllListeners('update-start-list-streaming')
      ipcRenderer.removeAllListeners('delete-start-list-streaming')
      ipcRenderer.send('stop-list-streaming')
      resolve()
    })
  },
  lazyFetchTimeline: async ({ state, commit, rootState }, loadPosition: LoadPositionWithList): Promise<Array<Status> | null> => {
    if (state.lazyLoading) {
      return Promise.resolve(null)
    }
    commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, true)
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    return client
      .get<Array<Status>>(`/timelines/list/${loadPosition.list_id}`, { max_id: loadPosition.status.id, limit: 40 })
      .then(res => {
        commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
      })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<ShowState, RootState>
