import Mastodon from 'megalodon'

export default {
  namespaced: true,
  state: {
    results: []
  },
  mutations: {
    updateResults (state, results) {
      state.results = results
    }
  },
  actions: {
    search ({ state, commit, rootState }, query) {
      commit('TimelineSpace/Contents/Search/changeLoading', true, { root: true })
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v2'
      )
      return client.get('/search', { q: query, resolve: true })
        .then(res => {
          commit('updateResults', res.data.hashtags)
          return res.data
        })
        .finally(() => {
          commit('TimelineSpace/Contents/Search/changeLoading', false, { root: true })
        })
    }
  }
}
