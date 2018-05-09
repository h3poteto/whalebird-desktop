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
    },
    updateAncestorsToot (state, message) {
      // Replace target message in ancestors
      state.ancestors = state.ancestors.map((toot) => {
        if (toot.id === message.id) {
          return message
        } else if (toot.reblog !== null && toot.reblog.id === message.id) {
          // When user reblog/favourite a reblogged toot, target message is a original toot.
          // So, a message which is received now is original toot.
          const reblog = {
            reblog: message
          }
          return Object.assign(toot, reblog)
        } else {
          return toot
        }
      })
    },
    deleteAncestorsToot (state, message) {
      state.ancestors = state.ancestors.filter((toot) => {
        if (toot.reblog !== null && toot.reblog.id === message.id) {
          return false
        } else {
          return toot.id !== message.id
        }
      })
    },
    updateToot (state, message) {
      if (state.message.id === message.id) {
        state.message = message
      } else if (state.message.reblog !== null && state.message.reblog.id === message.id) {
        // When user reblog/favourite a reblogged toot, target message is a original toot.
        // So, a message which is received now is original toot.
        const reblog = {
          reblog: message
        }
        state.message = Object.assign({}, state.message, reblog)
      }
    },
    deleteToot (state, message) {
      if (state.message.id === message.id) {
        state.message = null
      }
    },
    updateDescendantsToot (state, message) {
      // Replace target message in descendants
      state.descendants = state.descendants.map((toot) => {
        if (toot.id === message.id) {
          return message
        } else if (toot.reblog !== null && toot.reblog.id === message.id) {
          // When user reblog/favourite a reblogged toot, target message is a original toot.
          // So, a message which is received now is original toot.
          const reblog = {
            reblog: message
          }
          return Object.assign(toot, reblog)
        } else {
          return toot
        }
      })
    },
    deleteDescendantsToot (state, message) {
      state.descendants = state.descendants.filter((toot) => {
        if (toot.reblog !== null && toot.reblog.id === message.id) {
          return false
        } else {
          return toot.id !== message.id
        }
      })
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
