import generator, { Entity } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type ReportState = {
  modalOpen: boolean
  message: Entity.Status | null
}

const state = (): ReportState => ({
  modalOpen: false,
  message: null
})

export const MUTATION_TYPES = {
  CHANGE_MODAL_OPEN: 'changeModalOpen',
  CHANGE_MESSAGE: 'changeMessage'
}

const mutations: MutationTree<ReportState> = {
  [MUTATION_TYPES.CHANGE_MODAL_OPEN]: (state, value: boolean) => {
    state.modalOpen = value
  },
  [MUTATION_TYPES.CHANGE_MESSAGE]: (state, message: Entity.Status) => {
    state.message = message
  }
}

export const ACTION_TYPES = {
  OPEN_REPORT: 'openReport',
  SUBMIT: 'submit'
}

const actions: ActionTree<ReportState, RootState> = {
  [ACTION_TYPES.OPEN_REPORT]: ({ commit }, message: Entity.Status) => {
    commit(MUTATION_TYPES.CHANGE_MESSAGE, message)
    commit(MUTATION_TYPES.CHANGE_MODAL_OPEN, true)
  },
  [ACTION_TYPES.SUBMIT]: async ({ rootState }, { account_id, status_id, comment }) => {
    const client = generator(
      rootState.TimelineSpace.server!.sns,
      rootState.TimelineSpace.server!.baseURL,
      rootState.TimelineSpace.account!.accessToken,
      rootState.App.userAgent
    )
    return client.report(account_id, { comment: comment, status_ids: [status_id] })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<ReportState, RootState>
