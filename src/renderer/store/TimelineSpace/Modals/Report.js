import Mastodon from 'megalodon'

export default {
  namespaced: true,
  state: {
    modalOpen: false,
    message: {}
  },
  mutations: {
    changeModalOpen (state, value) {
      state.modalOpen = value
    },
    changeMessage (state, value) {
      state.message = value
    }
  },
  actions: {
    openReport ({ commit }, message) {
      commit('changeMessage', message)
      commit('changeModalOpen', true)
    },
    submit ({ rootState }, payload) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/reports`, {
        account_id: payload.account_id,
        status_ids: [payload.status_id],
        comment: payload.comment
      })
    }
  }
}
