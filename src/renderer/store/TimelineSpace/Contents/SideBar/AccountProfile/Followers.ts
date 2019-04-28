import Mastodon, { Account, Relationship, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface FollowersState {
  followers: Array<Account>,
  relationships: Array<Relationship>
}

const state = (): FollowersState => ({
  followers: [],
  relationships: []
})

export const MUTATION_TYPES = {
  UPDATE_FOLLOWERS: 'updateFollowers',
  UPDATE_RELATIONSHIPS: 'updateRelationships'
}

const mutations: MutationTree<FollowersState> = {
  [MUTATION_TYPES.UPDATE_FOLLOWERS]: (state, users: Array<Account>) => {
    state.followers = users
  },
  [MUTATION_TYPES.UPDATE_RELATIONSHIPS]: (state, relations: Array<Relationship>) => {
    state.relationships = relations
  }
}

const actions: ActionTree<FollowersState, RootState> = {
  fetchFollowers: async ({ commit, rootState }, account: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res: Response<Array<Account>> = await client.get<Array<Account>>(`/accounts/${account.id}/followers`, { limit: 80 })
    commit(MUTATION_TYPES.UPDATE_FOLLOWERS, res.data)
    return res.data
  },
  fetchRelationships: async ({ commit, rootState }, accounts: Array<Account>) => {
    const ids = accounts.map(a => a.id)
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res: Response<Array<Relationship>> = await client.get<Array<Relationship>>(`/accounts/relationships`, {
      id: ids
    })
    commit(MUTATION_TYPES.UPDATE_RELATIONSHIPS, res.data)
    return res.data
  }
}

const Followers: Module<FollowersState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Followers
