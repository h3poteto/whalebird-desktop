import Mastodon from 'megalodon'

export default {
  namespaced: true,
  state: {
    modalOpen: false,
    accounts: [],
    targetListId: null
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    },
    updateAccounts (state, accounts) {
      state.accounts = accounts
    },
    setListId (state, id) {
      state.targetListId = id
    }
  },
  actions: {
    changeModal ({ commit }, value) {
      commit('changeModal', value)
    },
    search ({ commit, rootState }, name) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/accounts/search', {
        q: name,
        following: true
      })
        .then(data => {
          commit('updateAccounts', data)
          return data
        })
    },
    add ({ state, rootState }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/lists/${state.targetListId}/accounts`, {
        account_ids: [account.id]
      })
    }
  }
}
