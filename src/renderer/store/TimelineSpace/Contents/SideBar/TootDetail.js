import Mastodon from 'mastodon-api'

const TootDetail = {
  namespaced: true,
  state: {
    message: null,
    ancestors: [],
    descendants: []
  },
  mutations: {
    changeToot (state, message) {
      state.message = message
    },
    updateAncestors (state, ancestors) {
      state.ancestors = ancestors
    },
    updateDescendants (state, descendants) {
      state.descendants = descendants
    }
  },
  actions: {
    changeToot ({ commit, dispatch }, message) {
      commit('changeToot', message)
    },
    fetchToot ({ state, commit, rootState }, message) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get(`/statuses/${message.id}/context`, { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateAncestors', data.ancestors)
          commit('updateDescendants', data.descendants)
          resolve(res)
        })
      })
    }
  }
}

export default TootDetail
