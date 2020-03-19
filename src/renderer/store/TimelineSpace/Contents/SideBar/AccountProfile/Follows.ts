import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type FollowsState = {
  follows: Array<Entity.Account>
  relationships: Array<Entity.Relationship>
}

const state = (): FollowsState => ({
  follows: [],
  relationships: []
})

export const MUTATION_TYPES = {
  UPDATE_FOLLOWS: 'updateFollows',
  UPDATE_RELATIONSHIPS: 'updateRelationships'
}

const mutations: MutationTree<FollowsState> = {
  [MUTATION_TYPES.UPDATE_FOLLOWS]: (state, users: Array<Entity.Account>) => {
    state.follows = users
  },
  [MUTATION_TYPES.UPDATE_RELATIONSHIPS]: (state, relations: Array<Entity.Relationship>) => {
    state.relationships = relations
  }
}

const actions: ActionTree<FollowsState, RootState> = {
  fetchFollows: async ({ commit, rootState }, account: Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getAccountFollowing(account.id, { limit: 80 })
    commit(MUTATION_TYPES.UPDATE_FOLLOWS, res.data)
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
    const res = await client.getRelationships(ids)
    commit(MUTATION_TYPES.UPDATE_RELATIONSHIPS, res.data)
    return res.data
  }
}

const Follows: Module<FollowsState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Follows
