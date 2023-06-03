import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'

export type DirectMessagesState = {
  timeline: { [key: number]: Array<Entity.Status> }
}

const state = (): DirectMessagesState => ({
  timeline: {}
})

export const MUTATION_TYPES = {
  APPEND_TIMELINE: 'appendTimeline',
  REPLACE_TIMELINE: 'replaceTimeline',
  INSERT_TIMELINE: 'insertTimeline',
  UPDATE_TOOT: 'updateToot',
  DELETE_TOOT: 'deleteToot'
}

const mutations: MutationTree<DirectMessagesState> = {
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
    if (!state.timeline[obj.accountId]) return
    // Replace target message in DirectMessagesTimeline and notifications
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
    if (!state.timeline[obj.accountId]) return
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
  FETCH_TIMELINE: 'fetchTimeline',
  LAZY_FETCH_TIMELINE: 'lazyFetchTimeline'
}

const actions: ActionTree<DirectMessagesState, RootState> = {
  [ACTION_TYPES.FETCH_TIMELINE]: async (
    { commit, rootState },
    req: { account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Status>> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    try {
      const res = await client.getConversationTimeline({ limit: 20 })
      const statuses: Array<Entity.Status> = res.data.map(con => con.last_status!)
      commit(MUTATION_TYPES.REPLACE_TIMELINE, { statuses, accountId: req.account.id }) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      return statuses
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
    return client.getConversationTimeline({ max_id: req.lastStatus.id, limit: 20 }).then(res => {
      const statuses: Array<Entity.Status> = res.data.map(con => con.last_status!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      commit(MUTATION_TYPES.INSERT_TIMELINE, { statuses, accountId: req.account.id })
      return statuses
    })
  }
}

const DirectMessages: Module<DirectMessagesState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default DirectMessages
