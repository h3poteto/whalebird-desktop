import Mastodon, { List, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type IndexState = {
  lists: Array<List>
}

const state = (): IndexState => ({
  lists: []
})

export const MUTATION_TYPES = {
  CHANGE_LISTS: 'changeLists'
}

const mutations: MutationTree<IndexState> = {
  [MUTATION_TYPES.CHANGE_LISTS]: (state, lists: Array<List>) => {
    state.lists = lists
  }
}

const actions: ActionTree<IndexState, RootState> = {
  fetchLists: async ({ commit, rootState }): Promise<Array<List>> => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Array<List>> = await client.get<Array<List>>('/lists')
    commit(MUTATION_TYPES.CHANGE_LISTS, res.data)
    return res.data
  },
  createList: async ({ rootState }, title: string): Promise<List> => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<List> = await client.post<List>('/lists', {
      title: title
    })
    return res.data
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<IndexState, RootState>
