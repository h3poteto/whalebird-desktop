import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import Visibility, { VisibilityType } from '~/src/constants/visibility'
import { RootState } from '@/store'

export type GeneralState = {
  visibility: number
  sensitive: boolean
}

const state = (): GeneralState => ({
  visibility: Visibility.Public.value,
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
  fetchSettings: async ({ commit, rootState }): Promise<Entity.Account> => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.verifyAccountCredentials()
    const visibility: VisibilityType | undefined = (Object.values(Visibility) as Array<VisibilityType>).find(v => {
      return v.key === res.data.source!.privacy
    })
    commit(MUTATION_TYPES.CHANGE_VISIBILITY, visibility!.value)
    commit(MUTATION_TYPES.CHANGE_SENSITIVE, res.data.source!.sensitive)
    return res.data
  },
  setVisibility: async ({ commit, rootState }, value: number) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const visibility: VisibilityType | undefined = (Object.values(Visibility) as Array<VisibilityType>).find(v => {
      return v.value === value
    })
    const res = await client.updateCredentials({ source: { privacy: visibility!.key } })
    commit(MUTATION_TYPES.CHANGE_VISIBILITY, visibility!.value)
    return res.data
  },
  setSensitive: async ({ commit, rootState }, value: boolean) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.updateCredentials({ source: { sensitive: value } })
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
