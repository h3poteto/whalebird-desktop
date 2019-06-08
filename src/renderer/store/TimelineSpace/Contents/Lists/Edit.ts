import Mastodon, { Account, Response } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { RemoveAccountFromList } from '@/types/removeAccountFromList'

export type EditState = {
  members: Array<Account>
}

const state = (): EditState => ({
  members: []
})

export const MUTATION_TYPES = {
  CHANGE_MEMBERS: 'changeMembers'
}

const mutations: MutationTree<EditState> = {
  [MUTATION_TYPES.CHANGE_MEMBERS]: (state, members: Array<Account>) => {
    state.members = members
  }
}

const actions: ActionTree<EditState, RootState> = {
  fetchMembers: async ({ commit, rootState }, listId: string): Promise<Array<Account>> => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    const res: Response<Array<Account>> = await client.get<Array<Account>>(`/lists/${listId}/accounts`, {
      limit: 0
    })
    commit(MUTATION_TYPES.CHANGE_MEMBERS, res.data)
    return res.data
  },
  removeAccount: async ({ rootState }, remove: RemoveAccountFromList): Promise<{}> => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    return client.del<{}>(`/lists/${remove.listId}/accounts`, {
      account_ids: [remove.account.id]
    })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<EditState, RootState>
