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

const actions: ActionTree<ReportState, RootState> = {
  openReport: ({ commit }, message: Entity.Status) => {
    commit(MUTATION_TYPES.CHANGE_MESSAGE, message)
    commit(MUTATION_TYPES.CHANGE_MODAL_OPEN, true)
  },
  submit: async ({ rootState }, { account_id, status_id, comment }) => {
    const client = generator(
      rootState.TimelineSpace.sns,
      rootState.TimelineSpace.account.baseURL,
      rootState.TimelineSpace.account.accessToken,
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    return client.report(account_id, comment, { status_ids: [status_id] })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<ReportState, RootState>
