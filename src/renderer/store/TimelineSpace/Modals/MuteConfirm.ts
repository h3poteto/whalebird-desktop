import generator from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type MuteConfirmState = {
  modalOpen: boolean
  account: Account | null
}

const state = (): MuteConfirmState => ({
  modalOpen: false,
  account: null
})

export const MUTATION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  CHANGE_ACCOUNT: 'changeAccount'
}

const mutations: MutationTree<MuteConfirmState> = {
  [MUTATION_TYPES.CHANGE_MODAL]: (state, value: boolean) => {
    state.modalOpen = value
  },
  [MUTATION_TYPES.CHANGE_ACCOUNT]: (state, account: Account) => {
    state.account = account
  }
}

const actions: ActionTree<MuteConfirmState, RootState> = {
  changeModal: ({ commit }, value: boolean) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, value)
  },
  changeAccount: ({ commit }, account: Account) => {
    commit(MUTATION_TYPES.CHANGE_ACCOUNT, account)
  },
  submit: async ({ state, rootState, dispatch }, notify: boolean) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res = await client.muteAccount(state.account!.id, notify)
    // Reload relationship
    dispatch('TimelineSpace/Contents/SideBar/AccountProfile/fetchRelationship', state.account, { root: true })
    return res.data
  }
}

const MuteConfirm: Module<MuteConfirmState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default MuteConfirm
