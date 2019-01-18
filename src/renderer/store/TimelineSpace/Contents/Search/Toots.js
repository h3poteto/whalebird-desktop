import Mastodon from 'megalodon'

const Toots = {
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
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/search', { q: query, resolve: true })
        .then(res => {
          commit('updateResults', res.data.statuses)
          return res.data
        })
        .finally(() => {
          commit('TimelineSpace/Contents/Search/changeLoading', false, { root: true })
        })
    }
  }
}

export default Toots
