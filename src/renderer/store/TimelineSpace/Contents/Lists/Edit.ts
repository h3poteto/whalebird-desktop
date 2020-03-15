import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { RemoveAccountFromList } from '@/types/removeAccountFromList'

export type EditState = {
  members: Array<Entity.Account>
}

const state = (): EditState => ({
  members: []
})

export const MUTATION_TYPES = {
  CHANGE_MEMBERS: 'changeMembers'
}

const mutations: MutationTree<EditState> = {
  [MUTATION_TYPES.CHANGE_MEMBERS]: (state, members: Array<Entity.Account>) => {
    state.members = members
  }
}

const actions: ActionTree<EditState, RootState> = {
  fetchMembers: async ({ commit, rootState }, listId: string): Promise<Array<Entity.Account>> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.getAccountsInList(listId, { limit: 0 })
    commit(MUTATION_TYPES.CHANGE_MEMBERS, res.data)
    return res.data
  },
  removeAccount: async ({ rootState }, remove: RemoveAccountFromList): Promise<{}> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    return client.deleteAccountsFromList(remove.listId, [remove.account.id])
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<EditState, RootState>
