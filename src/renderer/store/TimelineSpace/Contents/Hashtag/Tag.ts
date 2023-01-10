import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { MyWindow } from '~/src/types/global'
import { LocalAccount } from '~src/types/localAccount'
import { LocalServer } from '~src/types/localServer'

const win = (window as any) as MyWindow

export type TagState = {
  timeline: Array<Entity.Status>
}

const state = (): TagState => ({
  timeline: []
})

export const MUTATION_TYPES = {
  APPEND_TIMELINE: 'appendTimeline',
  REPLACE_TIMELINE: 'replaceTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot'
}

const mutations: MutationTree<TagState> = {
  [MUTATION_TYPES.APPEND_TIMELINE]: (state, update: Entity.Status) => {
    state.timeline = [update].concat(state.timeline)
  },
  [MUTATION_TYPES.REPLACE_TIMELINE]: (state, timeline: Array<Entity.Status>) => {
    state.timeline = timeline
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, messages: Array<Entity.Status>) => {
    state.timeline = state.timeline.concat(messages)
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
  }
}

export const ACTION_TYPES = {
  FETCH: 'fetch',
  START_STREAMING: 'startStreaming',
  STOP_STREAMING: 'stopStreaming',
  LAZY_FETCH_TIMELINE: 'lazyFetchTimeline'
}

const actions: ActionTree<TagState, RootState> = {
  [ACTION_TYPES.FETCH]: async (
    { commit, rootState },
    req: { tag: string; account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Status>> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const res = await client.getTagTimeline(encodeURIComponent(req.tag), { limit: 20 })
    commit(MUTATION_TYPES.REPLACE_TIMELINE, res.data)
    return res.data
  },
  [ACTION_TYPES.START_STREAMING]: ({ commit }, req: { tag: string; account: LocalAccount }) => {
    win.ipcRenderer.on(`update-tag-streamings-${req.account.id}`, (_, update: Entity.Status) => {
      commit(MUTATION_TYPES.APPEND_TIMELINE, update)
    })
    win.ipcRenderer.on(`delete-tag-streamings-${req.account.id}`, (_, id: string) => {
      commit(MUTATION_TYPES.DELETE_TOOT, id)
    })
    // @ts-ignore
    return new Promise((resolve, reject) => {
      // eslint-disable-line no-unused-vars
      win.ipcRenderer.send('start-tag-streaming', {
        tag: encodeURIComponent(req.tag),
        accountId: req.account.id
      })
    })
  },
  [ACTION_TYPES.STOP_STREAMING]: ({ rootState }) => {
    return new Promise(resolve => {
      if (rootState.TimelineSpace.account) {
        win.ipcRenderer.removeAllListeners(`update-tag-streamings-${rootState.TimelineSpace.account.id}`)
        win.ipcRenderer.removeAllListeners(`update-tag-streamings-${rootState.TimelineSpace.account.id}`)
      }
      resolve(null)
    })
  },
  [ACTION_TYPES.LAZY_FETCH_TIMELINE]: async (
    { commit, rootState },
    req: {
      tag: string
      status: Entity.Status
      account: LocalAccount
      server: LocalServer
    }
  ): Promise<Array<Entity.Status> | null> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    return client.getTagTimeline(req.tag, { max_id: req.status.id, limit: 20 }).then(res => {
      commit(MUTATION_TYPES.INSERT_TIMELINE, res.data)
      return res.data
    })
  }
}

const Tag: Module<TagState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Tag
