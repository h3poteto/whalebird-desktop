import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type MuteConfirmState = {
  modalOpen: boolean
  account: Entity.Account | null
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
  [MUTATION_TYPES.CHANGE_ACCOUNT]: (state, account: Entity.Account) => {
    state.account = account
  }
}

export const ACTION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  CHANGE_ACCOUNT: 'changeAccount',
  SUBMIT: 'submit'
}

const actions: ActionTree<MuteConfirmState, RootState> = {
  [ACTION_TYPES.CHANGE_MODAL]: ({ commit }, value: boolean) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, value)
  },
  [ACTION_TYPES.CHANGE_ACCOUNT]: ({ commit }, account: Entity.Account) => {
    commit(MUTATION_TYPES.CHANGE_ACCOUNT, account)
  },
  [ACTION_TYPES.SUBMIT]: async ({ state, rootState }, notify: boolean) => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    const res = await client.muteAccount(state.account!.id, notify)
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
