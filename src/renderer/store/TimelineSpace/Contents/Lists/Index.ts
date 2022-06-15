import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type IndexState = {
  lists: Array<Entity.List>
}

const state = (): IndexState => ({
  lists: []
})

export const MUTATION_TYPES = {
  CHANGE_LISTS: 'changeLists'
}

const mutations: MutationTree<IndexState> = {
  [MUTATION_TYPES.CHANGE_LISTS]: (state, lists: Array<Entity.List>) => {
    state.lists = lists
  }
}

export const ACTION_TYPES = {
  FETCH_LISTS: 'fetchLists',
  CREATE_LIST: 'createList',
  DELETE_LIST: 'deleteList'
}

const actions: ActionTree<IndexState, RootState> = {
  [ACTION_TYPES.FETCH_LISTS]: async ({ commit, rootState }): Promise<Array<Entity.List>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.getLists()
    commit(MUTATION_TYPES.CHANGE_LISTS, res.data)
    return res.data
  },
  [ACTION_TYPES.CREATE_LIST]: async ({ rootState }, title: string): Promise<Entity.List> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.createList(title)
    return res.data
  },
  [ACTION_TYPES.DELETE_LIST]: async ({ dispatch, rootState }, list: Entity.List) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent
    )
    const res = await client.deleteList(list.id)
    dispatch(ACTION_TYPES.FETCH_LISTS)
    return res.data
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<IndexState, RootState>
