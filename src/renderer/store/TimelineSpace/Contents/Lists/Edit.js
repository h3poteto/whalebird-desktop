import Mastodon from 'megalodon'

export default {
  namespaced: true,
  state: {
    members: []
  },
  mutations: {
    changeMembers (state, members) {
      state.members = members
    }
  },
  actions: {
    fetchMembers ({ commit, rootState }, listId) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/lists/${listId}/accounts`, {
        limit: 0
      })
        .then((data) => {
          commit('changeMembers', data)
        })
    },
    removeAccount ({ rootState }, obj) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.del(`/lists/${obj.listId}/accounts`, {
        account_ids: [obj.account.id]
      })
    }
  }
}
