import generator, { Entity } from 'megalodon'
import parse from 'parse-link-header'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type FollowersState = {
  followers: Array<Entity.Account>
  relationships: Array<Entity.Relationship>
  lazyLoading: boolean
  maxId: string | null
}

const state = (): FollowersState => ({
  followers: [],
  relationships: [],
  lazyLoading: false,
  maxId: null
})

export const MUTATION_TYPES = {
  UPDATE_FOLLOWERS: 'updateFollowers',
  APPEND_FOLLOWERS: 'appendFollowers',
  UPDATE_RELATIONSHIPS: 'updateRelationships',
  CHANGE_LAZY_LOADING: 'changeLazyLoading',
  CHANGE_MAX_ID: 'changeMaxId'
}

const mutations: MutationTree<FollowersState> = {
  [MUTATION_TYPES.UPDATE_FOLLOWERS]: (state, users: Array<Entity.Account>) => {
    state.followers = users
  },
  [MUTATION_TYPES.APPEND_FOLLOWERS]: (state, users: Array<Entity.Account>) => {
    state.followers = state.followers.concat(users)
  },
  [MUTATION_TYPES.UPDATE_RELATIONSHIPS]: (state, relations: Array<Entity.Relationship>) => {
    state.relationships = relations
  },
  [MUTATION_TYPES.CHANGE_LAZY_LOADING]: (state, loading: boolean) => {
    state.lazyLoading = loading
  },
  [MUTATION_TYPES.CHANGE_MAX_ID]: (state, maxId: string | null) => {
    state.maxId = maxId
  }
}

const actions: ActionTree<FollowersState, RootState> = {
  fetchFollowers: async ({ commit, rootState }, account: Entity.Account) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.getAccountFollowers(account.id, { limit: 80 })
    commit(MUTATION_TYPES.UPDATE_FOLLOWERS, res.data)
    // Parse link header
    try {
      const link = parse(res.headers.link)
      if (link !== null) {
        commit(MUTATION_TYPES.CHANGE_MAX_ID, link.next.max_id)
      } else {
        commit(MUTATION_TYPES.CHANGE_MAX_ID, null)
      }
    } catch (err) {
      commit(MUTATION_TYPES.CHANGE_MAX_ID, null)
      console.error(err)
    }
    return res.data
  },
  lazyFetchFollowers: async ({ commit, state, rootState }, account: Entity.Account) => {
    if (state.lazyLoading) {
      return Promise.resolve(null)
    }
    if (!state.maxId) {
      return Promise.resolve(null)
    }
    commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, true)
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.getAccountFollowers(account.id, { limit: 80, max_id: state.maxId }).finally(() => {
      commit(MUTATION_TYPES.CHANGE_LAZY_LOADING, false)
    })

    commit(MUTATION_TYPES.APPEND_FOLLOWERS, res.data)
    // Parse link header
    try {
      const link = parse(res.headers.link)
      if (link !== null) {
        commit(MUTATION_TYPES.CHANGE_MAX_ID, link.next.max_id)
      } else {
        commit(MUTATION_TYPES.CHANGE_MAX_ID, null)
      }
    } catch (err) {
      commit(MUTATION_TYPES.CHANGE_MAX_ID, null)
      console.error(err)
    }
    return res.data
  },
  fetchRelationships: async ({ commit, rootState }, accounts: Array<Entity.Account>) => {
    const ids = accounts.map(a => a.id)
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,

      rootState.App.userAgent
    )
    const res = await client.getRelationships(ids)
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
