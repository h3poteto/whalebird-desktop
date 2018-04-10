import Mastodon from 'mastodon-api'

const TootDetail = {
  namespaced: true,
  state: {
    message: null,
    loading: false,
    ancestors: [],
    descendants: []
  },
  mutations: {
    changeToot (state, message) {
      state.message = message
    },
    changeLoading (state, value) {
      state.loading = value
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
        commit('TimelineSpace/Contents/SideBar/TootDetail/changeLoading', true, { root: true })
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get(`/statuses/${message.id}/context`, { limit: 40 }, (err, data, res) => {
          if (err) return reject(err)
          commit('updateAncestors', data.ancestors)
          commit('updateDescendants', data.descendants)
          commit('TimelineSpace/Contents/SideBar/TootDetail/changeLoading', false, { root: true })
          resolve(res)
        })
      })
    }
  }
}

export default TootDetail
