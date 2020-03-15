import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

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

const actions: ActionTree<FollowRequestsState, RootState> = {
  fetchRequests: async ({ commit, rootState }): Promise<Array<Entity.Account>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getFollowRequests()
    commit(MUTATION_TYPES.UPDATE_REQUESTS, res.data)
    return res.data
  },
  acceptRequest: async ({ dispatch, rootState }, user: Entity.Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.acceptFollowRequest(user.id)
    await dispatch('fetchRequests')
    dispatch('TimelineSpace/SideMenu/fetchFollowRequests', rootState.TimelineSpace.account, { root: true })
    return res.data
  },
  rejectRequest: async ({ dispatch, rootState }, user: Entity.Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.rejectFollowRequest(user.id)
    await dispatch('fetchRequests')
    dispatch('TimelineSpace/SideMenu/fetchFollowRequests', rootState.TimelineSpace.account, { root: true })
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
