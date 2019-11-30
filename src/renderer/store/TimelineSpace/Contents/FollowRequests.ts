import Mastodon, { Account, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type FollowRequestsState = {
  requests: Array<Account>
}

const state = (): FollowRequestsState => ({
  requests: []
})

export const MUTATION_TYPES = {
  UPDATE_REQUESTS: 'updateRequests'
}

const mutations: MutationTree<FollowRequestsState> = {
  [MUTATION_TYPES.UPDATE_REQUESTS]: (state, accounts: Array<Account>) => {
    state.requests = accounts
  }
}

const actions: ActionTree<FollowRequestsState, RootState> = {
  fetchRequests: async ({ commit, rootState }): Promise<Array<Account>> => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Array<Account>> = await client.get<Array<Account>>('/follow_requests')
    commit(MUTATION_TYPES.UPDATE_REQUESTS, res.data)
    return res.data
  },
  acceptRequest: async ({ dispatch, rootState }, user: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<{}> = await client.post<{}>(`/follow_requests/${user.id}/authorize`)
    await dispatch('fetchRequests')
    dispatch('TimelineSpace/SideMenu/fetchFollowRequests', rootState.TimelineSpace.account, { root: true })
    return res.data
  },
  rejectRequest: async ({ dispatch, rootState }, user: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<{}> = await client.post<{}>(`/follow_requests/${user.id}/reject`)
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
