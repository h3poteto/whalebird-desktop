import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'

export type FollowRequestsState = {
  requests: Array<Entity.Account>
}

const state = (): FollowRequestsState => ({
  requests: []
})

export const MUTATION_TYPES = {
  UPDATE_REQUESTS: 'updateRequests'
}

const mutations: MutationTree<FollowRequestsState> = {
  [MUTATION_TYPES.UPDATE_REQUESTS]: (state, accounts: Array<Entity.Account>) => {
    state.requests = accounts
  }
}

export const ACTION_TYPES = {
  FETCH_REQUESTS: 'fetchRequests',
  ACCEPT_REQUEST: 'acceptRequest',
  REJECT_REQUEST: 'rejectRequest'
}

const actions: ActionTree<FollowRequestsState, RootState> = {
  [ACTION_TYPES.FETCH_REQUESTS]: async (
    { commit, rootState },
    req: { account: LocalAccount; server: LocalServer }
  ): Promise<Array<Entity.Account>> => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const res = await client.getFollowRequests()
    commit(MUTATION_TYPES.UPDATE_REQUESTS, res.data)
    return res.data
  },
  [ACTION_TYPES.ACCEPT_REQUEST]: async (
    { dispatch, rootState },
    req: { user: Entity.Account; account: LocalAccount; server: LocalServer }
  ) => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const res = await client.acceptFollowRequest(req.user.id)
    await dispatch(ACTION_TYPES.FETCH_REQUESTS, { account: req.account, server: req.server })
    return res.data
  },
  [ACTION_TYPES.REJECT_REQUEST]: async (
    { dispatch, rootState },
    req: { user: Entity.Account; account: LocalAccount; server: LocalServer }
  ) => {
    const client = generator(req.server.sns, req.server.baseURL, req.account.accessToken, rootState.App.userAgent)
    const res = await client.rejectFollowRequest(req.user.id)
    await dispatch(ACTION_TYPES.FETCH_REQUESTS, { action: req.account, server: req.server })
    return res.data
  }
}

const FollowRequests: Module<FollowRequestsState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default FollowRequests
