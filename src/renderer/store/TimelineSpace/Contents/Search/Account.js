import Mastodon from 'mastodon-api'

const Account = {
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
      return new Promise((resolve, reject) => {
        commit('TimelineSpace/Contents/Search/changeLoading', true, { root: true })
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get('/search', { q: query }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateResults', data.accounts)
          commit('TimelineSpace/Contents/Search/changeLoading', false, { root: true })
          resolve(res)
        })
      })
    }
  }
}

export default Account
