import Mastodon from 'megalodon'

export default {
  namespaced: true,
  state: {
    lists: []
  },
  mutations: {
    changeLists (state, lists) {
      state.lists = lists
    }
  },
  actions: {
    fetchLists ({ commit, rootState }) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/lists')
        .then((data) => {
          commit('changeLists', data)
          return data
        })
    },
    createList ({ rootState }, title) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post('/lists', {
        title: title
      })
    }
  }
}
