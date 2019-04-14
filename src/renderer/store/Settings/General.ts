import Mastodon, { Account } from 'megalodon'
import Visibilities from '~/src/constants/visibility'
import { Module, MutationTree, ActionTree } from 'vuex'
import Visibility from '~/src/types/visibility'
import { RootState } from '@/store'

export interface GeneralState {
  visibility: number,
  sensitive: boolean
}

const state = (): GeneralState => ({
  visibility: Visibilities.Public.value,
  sensitive: false
})

export const MUTATION_TYPES = {
  CHANGE_VISIBILITY: 'changeVisibility',
  CHANGE_SENSITIVE: 'changeSensitive'
}

const mutations: MutationTree<GeneralState> = {
  [MUTATION_TYPES.CHANGE_VISIBILITY]: (state, value: number) => {
    state.visibility = value
  },
  [MUTATION_TYPES.CHANGE_SENSITIVE]: (state, value: boolean) => {
    state.sensitive = value
  }
}

const actions: ActionTree<GeneralState, RootState> = {
  fetchSettings: async ({ commit, rootState }): Promise<Account> => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res = await client.get<Account>('/accounts/verify_credentials')
    const visibility: Visibility | undefined = Object.values(Visibilities as Array<Visibility>).find((v) => {
      return v.key === res.data.source!.privacy
    })
    commit(MUTATION_TYPES.CHANGE_VISIBILITY, visibility!.value)
    commit(MUTATION_TYPES.CHANGE_SENSITIVE, res.data.source!.sensitive)
    return res.data
  },
  setVisibility: async ({ commit, rootState }, value: number) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const visibility = Object.values(Visibilities as Array<Visibility>).find((v) => {
      return v.value === value
    })
    const res = await client.patch<Account>('/accounts/update_credentials', {
      source: {
        privacy: visibility!.key
      }
    })
    commit(MUTATION_TYPES.CHANGE_VISIBILITY, visibility!.value)
    return res.data
  },
  setSensitive: async ({ commit, rootState }, value: boolean) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1'
    )
    const res = await client.patch<Account>('/accounts/update_credentials', {
      source: {
        sensitive: value
      }
    })
    commit(MUTATION_TYPES.CHANGE_SENSITIVE, value)
    return res.data
  }
}

const General: Module<GeneralState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default General
