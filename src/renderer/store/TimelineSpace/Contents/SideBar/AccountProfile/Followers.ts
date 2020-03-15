import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type FollowersState = {
  followers: Array<Entity.Account>
  relationships: Array<Entity.Relationship>
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
  [MUTATION_TYPES.UPDATE_FOLLOWERS]: (state, users: Array<Entity.Account>) => {
    state.followers = users
  },
  [MUTATION_TYPES.UPDATE_RELATIONSHIPS]: (state, relations: Array<Entity.Relationship>) => {
    state.relationships = relations
  }
}

const actions: ActionTree<FollowersState, RootState> = {
  fetchFollowers: async ({ commit, rootState }, account: Entity.Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getAccountFollowers(account.id, { limit: 80 })
    commit(MUTATION_TYPES.UPDATE_FOLLOWERS, res.data)
    return res.data
  },
  fetchRelationships: async ({ commit, rootState }, accounts: Array<Entity.Account>) => {
    const ids = accounts.map(a => a.id)
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,

      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getRelationship(ids)
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
