import Mastodon, { Status } from 'megalodon'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type ReportState = {
  modalOpen: boolean
  message: Status | null
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
  [MUTATION_TYPES.CHANGE_MESSAGE]: (state, message: Status) => {
    state.message = message
  }
}

const actions: ActionTree<ReportState, RootState> = {
  openReport: ({ commit }, message: Status) => {
    commit(MUTATION_TYPES.CHANGE_MESSAGE, message)
    commit(MUTATION_TYPES.CHANGE_MODAL_OPEN, true)
  },
  submit: async ({ rootState }, { account_id, status_id, comment }) => {
    const client = new Mastodon(rootState.TimelineSpace.account.accessToken!, rootState.TimelineSpace.account.baseURL + '/api/v1')
    return client.post<{}>(`/reports`, {
      account_id: account_id,
      status_ids: [status_id],
      comment: comment
    })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<ReportState, RootState>
