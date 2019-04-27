import Mastodon, { Account, Relationship, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export interface FollowsState {
  follows: Array<Account>,
  relationships: Array<Relationship>
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
  [MUTATION_TYPES.UPDATE_FOLLOWS]: (state, users: Array<Account>) => {
    state.follows = users
  },
  [MUTATION_TYPES.UPDATE_RELATIONSHIPS]: (state, relations: Array<Relationship>) => {
    state.relationships = relations
  }
}

const actions: ActionTree<FollowsState, RootState> = {
  fetchFollows: async ({ commit, rootState }, account: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res: Response<Array<Account>> = await client.get<Array<Account>>(`/accounts/${account.id}/following`, { limit: 80 })
    commit(MUTATION_TYPES.UPDATE_FOLLOWS, res.data)
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

const Follows: Module<FollowsState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Follows
