import Mastodon from 'megalodon'

export default {
  namespaced: true,
  state: {
    modalOpen: false,
    account: {}
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    },
    changeAccount (state, account) {
      state.account = account
    }
  },
  actions: {
    changeModal ({ commit }, value) {
      commit('changeModal', value)
    },
    changeAccount ({ commit }, account) {
      commit('changeAccount', account)
    },
    async submit ({ state, rootState, dispatch }, notify) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${state.account.id}/mute`, {
        notifications: notify
      })
        .then(res => {
          // Reload relationship
          dispatch('TimelineSpace/Contents/SideBar/AccountProfile/fetchRelationship', state.account, { root: true })
          return res.data
        })
    }
  }
}
