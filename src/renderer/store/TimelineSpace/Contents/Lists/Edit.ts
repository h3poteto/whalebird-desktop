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

export const ACTION_TYPES = {
  FETCH_MEMBERS: 'fetchMembers',
  REMOVE_ACCOUNT: 'removeAccount'
}

const actions: ActionTree<EditState, RootState> = {
  [ACTION_TYPES.FETCH_MEMBERS]: async ({ commit, rootState }, listId: string): Promise<Array<Entity.Account>> => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    const res = await client.getAccountsInList(listId, { limit: 0 })
    commit(MUTATION_TYPES.CHANGE_MEMBERS, res.data)
    return res.data
  },
  [ACTION_TYPES.REMOVE_ACCOUNT]: async ({ rootState }, remove: RemoveAccountFromList): Promise<{}> => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
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
