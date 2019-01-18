import Mastodon from 'megalodon'

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
      commit('updateAncestors', [])
      commit('updateDescendants', [])
      commit('changeToot', message)
    },
    fetchToot ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/statuses/${message.id}/context`, { limit: 40 })
        .then(res => {
          commit('updateAncestors', res.data.ancestors)
          commit('updateDescendants', res.data.descendants)
          return res.data
        })
    }
  }
}

export default TootDetail
