import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { LocalAccount } from '~src/types/localAccount'
import { LocalServer } from '~src/types/localServer'

export type LocalState = {
  timeline: { [key: number]: Array<Entity.Status> }
}

const state = (): LocalState => ({
  timeline: {}
})

export const MUTATION_TYPES = {
  APPEND_TIMELINE: 'appendTimeline',
  REPLACE_TIMELINE: 'replaceTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot'
}

const mutations: MutationTree<LocalState> = {
  [MUTATION_TYPES.APPEND_TIMELINE]: (state, obj: { status: Entity.Status; accountId: number }) => {
    if (state.timeline[obj.accountId]) {
      state.timeline[obj.accountId] = [obj.status, ...state.timeline[obj.accountId]]
    } else {
      state.timeline[obj.accountId] = [obj.status]
    }
  },
  [MUTATION_TYPES.REPLACE_TIMELINE]: (state, obj: { statuses: Array<Entity.Status>; accountId: number }) => {
    state.timeline[obj.accountId] = obj.statuses
  },
  [MUTATION_TYPES.INSERT_TIMELINE]: (state, obj: { statuses: Array<Entity.Status>; accountId: number }) => {
    if (state.timeline[obj.accountId]) {
      state.timeline[obj.accountId] = [...state.timeline[obj.accountId], ...obj.statuses]
    } else {
      state.timeline[obj.accountId] = obj.statuses
    }
  },
  [MUTATION_TYPES.UPDATE_TOOT]: (state, obj: { status: Entity.Status; accountId: number }) => {
    state.timeline[obj.accountId] = state.timeline[obj.accountId].map(toot => {
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
    state.timeline[obj.accountId] = state.timeline[obj.accountId].filter(toot => {
      if (toot.reblog !== null && toot.reblog.id === obj.statusId) {
        return false
      } else {
        return toot.id !== obj.statusId
      }
    })
  }
}

export const ACTION_TYPES = {
  FETCH_LOCAL_TIMELINE: 'fetchLocalTimeline',
  LAZY_FETCH_TIMELINE: 'lazyFetchTimeline'
}

const actions: ActionTree<LocalState, RootState> = {
  [ACTION_TYPES.FETCH_LOCAL_TIMELINE]: async (
    { commit, rootState },
    req: { account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Status>> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)

    try {
      const res = await client.getLocalTimeline({ limit: 20 })
      commit(MUTATION_TYPES.REPLACE_TIMELINE, { statuses: res.data, accountId: req.account.id })
      return res.data
    } catch (err) {
      console.error(err)
      return []
    }
  },
  [ACTION_TYPES.LAZY_FETCH_TIMELINE]: async (
    { commit, rootState },
    req: { lastStatus: Entity.Status; account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Status> | null> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    return client.getLocalTimeline({ max_id: req.lastStatus.id, limit: 20 }).then(res => {
      commit(MUTATION_TYPES.INSERT_TIMELINE, { statuses: res.data, accountId: req.account.id })
      return res.data
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
